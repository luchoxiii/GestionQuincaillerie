import { describe, it, expect } from 'vitest';
import {
  validateAndNormalizeProducts,
  validateAndNormalizeCustomers,
  ParsedProductRow,
  ParsedCustomerRow,
} from './excel-import.service';
import { Product } from './products.service';
import { Customer } from '@ferreteria/shared';

describe('Excel Import Service — Pruebas de Estrés y Gran Volumen 🔥', () => {
  it('debería procesar y validar 3,000 filas de productos en menos de 3,500ms', () => {
    const mockRawRows: Record<string, any>[] = [];
    for (let i = 0; i < 3000; i++) {
      mockRawRows.push({
        'Código / SKU': `ART-BULK-${i}`,
        'Descripción / Nombre': `Artículo Masivo ${i} - Bulón 1/2 x 2"`,
        'Código de Barras': `779123456${(i % 1000).toString().padStart(4, '0')}`,
        'Rubro / Categoría': i % 2 === 0 ? 'Fijaciones' : 'Herramientas',
        'Precio de Costo': `$ ${(100 + (i % 500)).toLocaleString('es-AR')},50`,
        'Margen %': '35,0',
        'Alícuota IVA': '21%',
        'Stock Inicial': `${10 + (i % 50)}`,
        'Stock Mínimo': '5',
        'Unidad de Medida': 'UN',
      });
    }

    const existingProducts: Product[] = [
      {
        id: 'prod-exist-1',
        code: 'ART-BULK-10',
        sku: 'ART-BULK-10',
        name: 'Existente 10',
        costPrice: 100,
        profitMargin: 30,
        salePrice: 130,
        isActive: true,
      },
    ];

    const startTime = performance.now();
    const result: ParsedProductRow[] = validateAndNormalizeProducts(mockRawRows, existingProducts);
    const duration = performance.now() - startTime;

    expect(result.length).toBe(3000);
    expect(result[0].isValid).toBe(true);
    expect(result[10].isExisting).toBe(true);
    expect(result[10].existingId).toBe('prod-exist-1');
    expect(duration).toBeLessThan(3500);
  });

  it('debería procesar y validar 3,000 filas de clientes con detección de CUITs en menos de 2,500ms', () => {
    const mockCustomerRows: Record<string, any>[] = [];
    for (let i = 0; i < 3000; i++) {
      mockCustomerRows.push({
        'Razón Social / Nombre': `Cliente Empresa Corp ${i} SA`,
        'Tipo Doc': i % 2 === 0 ? 'CUIT' : 'DNI',
        'Número Documento': i % 2 === 0 ? `30-${(10000000 + i)}-9` : `${20000000 + i}`,
        'Condición IVA': i % 2 === 0 ? 'Responsable Inscripto' : 'Consumidor Final',
        'Teléfono / Celular': `11-${4000 + (i % 1000)}-${1000 + (i % 1000)}`,
        'Email': `contacto${i}@empresacorp.com`,
        'Domicilio': `Av. Rivadavia ${1000 + i}`,
        'Ciudad': 'CABA',
        'Límite de Crédito': `$ ${(50000 + (i % 10000)).toLocaleString('es-AR')}`,
      });
    }

    const existingCustomers: Customer[] = [
      {
        id: 'cust-exist-1',
        name: 'Cliente Existente',
        documentType: 'CUIT',
        documentNum: '30-10000050-9',
        taxCondition: 'RESPONSABLE_INSCRIPTO',
        creditLimit: 50000,
        balance: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const startTime = performance.now();
    const result: ParsedCustomerRow[] = validateAndNormalizeCustomers(mockCustomerRows, existingCustomers);
    const duration = performance.now() - startTime;

    expect(result.length).toBe(3000);
    expect(result[0].isValid).toBe(true);
    expect(result[50].isExisting).toBe(true);
    expect(duration).toBeLessThan(2500);
  });

  it('debería manejar 2,000 filas corruptas o vacías sin arrojar excepciones no controladas', () => {
    const corruptRows: Record<string, any>[] = [];
    for (let i = 0; i < 2000; i++) {
      corruptRows.push({
        Nombre: null,
        Costo: 'invalido-nan',
        Margen: undefined,
        Stock: '---',
        IVA: 'abc%',
      });
    }

    const startTime = performance.now();
    const result = validateAndNormalizeProducts(corruptRows, []);
    const duration = performance.now() - startTime;

    expect(result.length).toBe(2000);
    expect(result.every((r) => !r.isValid)).toBe(true);
    expect(duration).toBeLessThan(1500);
  });
});
