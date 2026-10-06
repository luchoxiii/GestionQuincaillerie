import * as XLSX from 'xlsx';
import { Product } from './products.service';
import { Customer } from '@ferreteria/shared';

export interface ParsedProductRow {
  rowNumber: number;
  sku: string;
  name: string;
  barcode?: string;
  categoryName?: string;
  costPrice: number;
  profitMargin: number;
  salePrice: number;
  taxRate: number;
  stock: number;
  minStock: number;
  unit: string;
  isValid: boolean;
  errors: string[];
  isExisting: boolean;
  existingId?: string;
}

export interface ParsedCustomerRow {
  rowNumber: number;
  name: string;
  documentType: string;
  documentNum: string;
  taxCondition: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  creditLimit: number;
  balance: number;
  isValid: boolean;
  errors: string[];
  isExisting: boolean;
  existingId?: string;
}

/**
 * Lee un archivo File (Excel .xlsx, .xls o .csv) y retorna un array de objetos con las filas
 */
export async function parseExcelFile(file: File): Promise<Record<string, any>[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];

  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
    defval: '',
    raw: false, // Convierte todo a string formateado para evitar sorpresas con números/fechas
  });

  return rows;
}

/**
 * Normaliza las claves de un objeto a minúsculas sin acentos ni espacios
 */
function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Busca el valor de una columna entre varias opciones posibles
 */
function getColumnValue(row: Record<string, any>, candidates: string[]): string {
  const candidateNorms = candidates.map(normalizeKey);

  // 1. Coincidencia exacta primero
  for (const [key, val] of Object.entries(row)) {
    const kNorm = normalizeKey(key);
    if (candidateNorms.includes(kNorm)) {
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        return String(val).trim();
      }
    }
  }

  // 2. Coincidencia por inclusión (ej. "nombredelproducto" incluye "nombre")
  for (const [key, val] of Object.entries(row)) {
    const kNorm = normalizeKey(key);
    for (const c of candidateNorms) {
      if (kNorm.includes(c) || c.includes(kNorm)) {
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          return String(val).trim();
        }
      }
    }
  }

  return '';
}

/**
 * Parsea un número de forma tolerante (admite "$", comas decimales, etc.)
 */
function parseNumber(val: any, defaultVal = 0): number {
  if (typeof val === 'number') return isNaN(val) ? defaultVal : val;
  if (!val) return defaultVal;
  const clean = String(val)
    .replace(/\$/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '') // Quita separadores de miles
    .replace(',', '.'); // Cambia coma decimal por punto
  const num = parseFloat(clean);
  return isNaN(num) ? defaultVal : num;
}

/**
 * Valida y normaliza filas de productos leídas desde Excel
 */
export function validateAndNormalizeProducts(
  rawRows: Record<string, any>[],
  existingProducts: Product[] = []
): ParsedProductRow[] {
  return rawRows.map((row, index) => {
    const rowNumber = index + 2; // Asumiendo fila 1 de encabezados
    const errors: string[] = [];

    const name = getColumnValue(row, ['nombre', 'producto', 'descripcion', 'name', 'articulo', 'detalle']);
    let sku = getColumnValue(row, ['codigo', 'sku', 'cod', 'code', 'codigo sku']);
    const barcode = getColumnValue(row, ['codigo de barras', 'barcode', 'ean', 'ean13', 'barra']);
    const categoryName = getColumnValue(row, ['categoria', 'rubro', 'category', 'familia']);
    const unit = getColumnValue(row, ['unidad', 'medida', 'uom', 'unit']) || 'UN';

    const costPrice = parseNumber(getColumnValue(row, ['costo', 'precio costo', 'cost_price', 'costo unitario']));
    let profitMargin = parseNumber(getColumnValue(row, ['margen', 'margen %', 'margen comercial', 'profit_margin']));
    let salePrice = parseNumber(getColumnValue(row, ['precio', 'precio venta', 'sale_price', 'precio final', 'venta']));
    const taxRate = parseNumber(getColumnValue(row, ['iva', 'alicuota', 'alicuota iva', 'tax', 'tasa iva']), 21);
    const stock = parseNumber(getColumnValue(row, ['stock', 'stock actual', 'existencias', 'cantidad', 'unidades']), 0);
    const minStock = parseNumber(getColumnValue(row, ['stock minimo', 'min_stock', 'minimo']), 5);

    if (!name) {
      errors.push('El nombre del producto es obligatorio');
    }

    // Auto-generar SKU si viene vacío
    if (!sku && name) {
      const initials = name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'ART');
      sku = `${initials}-${String(index + 1).padStart(3, '0')}`;
    }

    // Calcular precio de venta si solo vino costo y margen
    if (costPrice > 0 && profitMargin > 0 && salePrice === 0) {
      salePrice = Math.round(costPrice * (1 + profitMargin / 100));
    } else if (costPrice > 0 && salePrice > 0 && profitMargin === 0) {
      // Calcular margen si vino costo y precio venta
      profitMargin = Math.round(((salePrice - costPrice) / costPrice) * 100 * 10) / 10;
    }

    if (costPrice < 0 || salePrice < 0) {
      errors.push('Los precios no pueden ser negativos');
    }

    // Detección de duplicado en el catálogo existente
    const existing = existingProducts.find(
      (p) =>
        (sku && (p.sku?.toLowerCase() === sku.toLowerCase() || p.code?.toLowerCase() === sku.toLowerCase())) ||
        (barcode && p.barcodes?.some((b) => b.barcode === barcode))
    );

    return {
      rowNumber,
      sku,
      name,
      barcode,
      categoryName: categoryName || 'General',
      costPrice,
      profitMargin,
      salePrice,
      taxRate: [0, 10.5, 21, 27].includes(taxRate) ? taxRate : 21,
      stock,
      minStock,
      unit: unit.toUpperCase(),
      isValid: errors.length === 0,
      errors,
      isExisting: !!existing,
      existingId: existing?.id,
    };
  });
}

/**
 * Descarga la plantilla modelo de Excel para Productos
 */
export function downloadProductTemplate(format: 'xlsx' | 'csv' = 'xlsx') {
  const sampleData = [
    {
      'Código SKU': 'CEM-001',
      'Nombre del Producto': 'Cemento Loma Negra Portland 50kg',
      'Código de Barras': '7791234567890',
      'Categoría / Rubro': 'Materiales de Construcción',
      'Precio Costo ($)': 7500,
      'Margen (%)': 35,
      'Precio Venta ($)': 10125,
      'Alícuota IVA (%)': 21,
      'Stock Actual': 120,
      'Stock Mínimo': 20,
      'Unidad': 'BOLSA',
    },
    {
      'Código SKU': 'AMO-002',
      'Nombre del Producto': 'Amoladora Angular DeWalt 4 1/2" 820W',
      'Código de Barras': '7799876543210',
      'Categoría / Rubro': 'Herramientas Eléctricas',
      'Precio Costo ($)': 55000,
      'Margen (%)': 40,
      'Precio Venta ($)': 77000,
      'Alícuota IVA (%)': 21,
      'Stock Actual': 8,
      'Stock Mínimo': 3,
      'Unidad': 'UNID',
    },
    {
      'Código SKU': 'HIERRO-003',
      'Nombre del Producto': 'Varilla de Hierro Aletado 8mm x 12m',
      'Código de Barras': '7795551234567',
      'Categoría / Rubro': 'Hierros y Perfiles',
      'Precio Costo ($)': 3800,
      'Margen (%)': 30,
      'Precio Venta ($)': 4940,
      'Alícuota IVA (%)': 21,
      'Stock Actual': 250,
      'Stock Mínimo': 50,
      'Unidad': 'BARRA',
    },
    {
      'Código SKU': 'PIN-004',
      'Nombre del Producto': 'Pintura Látex Interior Alba 20 Lts Blanco',
      'Código de Barras': '7793334445556',
      'Categoría / Rubro': 'Pinturas y Accesorios',
      'Precio Costo ($)': 48000,
      'Margen (%)': 45,
      'Precio Venta ($)': 69600,
      'Alícuota IVA (%)': 21,
      'Stock Actual': 15,
      'Stock Mínimo': 4,
      'Unidad': 'BALDE',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  // Auto-ajustar anchos de columnas
  ws['!cols'] = [
    { wch: 15 }, // SKU
    { wch: 45 }, // Nombre
    { wch: 18 }, // Código de Barras
    { wch: 28 }, // Categoría
    { wch: 16 }, // Costo
    { wch: 12 }, // Margen
    { wch: 16 }, // Precio Venta
    { wch: 16 }, // IVA
    { wch: 14 }, // Stock
    { wch: 14 }, // Stock Min
    { wch: 12 }, // Unidad
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Productos');

  if (format === 'csv') {
    XLSX.writeFile(wb, 'plantilla_productos_ferreteria.csv', { bookType: 'csv' });
  } else {
    XLSX.writeFile(wb, 'plantilla_productos_ferreteria.xlsx');
  }
}

/**
 * Valida y normaliza filas de clientes leídas desde Excel
 */
export function validateAndNormalizeCustomers(
  rawRows: Record<string, any>[],
  existingCustomers: Customer[] = []
): ParsedCustomerRow[] {
  return rawRows.map((row, index) => {
    const rowNumber = index + 2;
    const errors: string[] = [];

    const name = getColumnValue(row, ['nombre', 'razon social', 'nombre / razon social', 'cliente', 'denominacion']);
    let documentType = getColumnValue(row, ['tipo documento', 'tipo doc', 'tipo', 'document_type']).toUpperCase() || 'DNI';
    let documentNum = getColumnValue(row, ['numero documento', 'documento', 'cuit', 'dni', 'cuit/dni', 'doc_num']);
    let taxCondition = getColumnValue(row, ['condicion iva', 'situacion iva', 'iva', 'tax_condition']).toUpperCase();
    const phone = getColumnValue(row, ['telefono', 'celular', 'whatsapp', 'phone', 'tel']);
    const email = getColumnValue(row, ['email', 'correo', 'correo electronico', 'e-mail']);
    const address = getColumnValue(row, ['direccion', 'domicilio', 'calle', 'address']);
    const city = getColumnValue(row, ['ciudad', 'localidad', 'municipio', 'city']);
    const creditLimit = parseNumber(getColumnValue(row, ['limite de credito', 'credito', 'credit_limit']), 0);
    const balance = parseNumber(getColumnValue(row, ['saldo inicial', 'saldo', 'deuda', 'balance']), 0);

    if (!name) {
      errors.push('El nombre o razón social es obligatorio');
    }

    // Normalizar CUIT vs DNI
    if (documentNum.replace(/[^0-9]/g, '').length === 11) {
      documentType = 'CUIT';
    } else if (documentNum.replace(/[^0-9]/g, '').length === 8) {
      documentType = 'DNI';
    }

    // Normalizar condición impositiva
    if (taxCondition.includes('INSCRIPTO')) {
      taxCondition = 'RESPONSABLE_INSCRIPTO';
    } else if (taxCondition.includes('MONO')) {
      taxCondition = 'MONOTRIBUTO';
    } else if (taxCondition.includes('EXENTO')) {
      taxCondition = 'EXENTO';
    } else {
      taxCondition = 'CONSUMIDOR_FINAL';
    }

    // Detección de duplicado por CUIT/DNI en la lista existente
    const cleanDoc = documentNum.replace(/[^0-9]/g, '');
    const existing = existingCustomers.find((c) => {
      const cDoc = (c.documentNum || (c as any).documentNumber || '').replace(/[^0-9]/g, '');
      return cleanDoc && cDoc && cleanDoc === cDoc;
    });

    return {
      rowNumber,
      name,
      documentType,
      documentNum,
      taxCondition,
      phone,
      email,
      address,
      city,
      creditLimit,
      balance,
      isValid: errors.length === 0,
      errors,
      isExisting: !!existing,
      existingId: existing?.id,
    };
  });
}

/**
 * Descarga la plantilla modelo de Excel para Clientes
 */
export function downloadCustomerTemplate(format: 'xlsx' | 'csv' = 'xlsx') {
  const sampleData = [
    {
      'Nombre / Razón Social': 'Constructora del Plata SA',
      'Tipo Documento': 'CUIT',
      'Número Documento': '30-71234567-8',
      'Condición IVA': 'Responsable Inscripto',
      'Teléfono / WhatsApp': '+54 9 11 4567-8901',
      'Email': 'compras@constructoradelplata.com',
      'Dirección': 'Av. Libertador 2450, Piso 5',
      'Ciudad / Localidad': 'Vicente López',
      'Límite de Crédito ($)': 1500000,
      'Saldo Inicial ($)': 0,
    },
    {
      'Nombre / Razón Social': 'Roberto Carlos Díaz (Instalaciones)',
      'Tipo Documento': 'CUIT',
      'Número Documento': '20-28456789-4',
      'Condición IVA': 'Monotributo',
      'Teléfono / WhatsApp': '+54 9 11 3456-7890',
      'Email': 'roberto.instalaciones@gmail.com',
      'Dirección': 'Calle San Martín 1234',
      'Ciudad / Localidad': 'San Isidro',
      'Límite de Crédito ($)': 350000,
      'Saldo Inicial ($)': 45000,
    },
    {
      'Nombre / Razón Social': 'Juan Pérez (Consumidor Final)',
      'Tipo Documento': 'DNI',
      'Número Documento': '35123456',
      'Condición IVA': 'Consumidor Final',
      'Teléfono / WhatsApp': '+54 9 11 6789-0123',
      'Email': 'juanperez@outlook.com',
      'Dirección': 'Belgrano 567',
      'Ciudad / Localidad': 'Olivos',
      'Límite de Crédito ($)': 0,
      'Saldo Inicial ($)': 0,
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  ws['!cols'] = [
    { wch: 35 }, // Razón Social
    { wch: 15 }, // Tipo Doc
    { wch: 20 }, // Número Doc
    { wch: 25 }, // Condición IVA
    { wch: 22 }, // Teléfono
    { wch: 32 }, // Email
    { wch: 35 }, // Dirección
    { wch: 22 }, // Ciudad
    { wch: 20 }, // Límite Crédito
    { wch: 18 }, // Saldo
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Clientes');

  if (format === 'csv') {
    XLSX.writeFile(wb, 'plantilla_clientes_ferreteria.csv', { bookType: 'csv' });
  } else {
    XLSX.writeFile(wb, 'plantilla_clientes_ferreteria.xlsx');
  }
}
