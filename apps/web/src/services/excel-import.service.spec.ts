import { describe, it, expect } from 'vitest';
import {
  validateAndNormalizeProducts,
  validateAndNormalizeCustomers,
  downloadProductTemplate,
  downloadCustomerTemplate,
} from './excel-import.service';
import { Product } from './products.service';
import { Customer } from '@ferreteria/shared';

describe('Excel Import Service', () => {
  describe('validateAndNormalizeProducts', () => {
    const existingProducts: Product[] = [
      {
        id: 'prod-100',
        code: 'TAL-001',
        sku: 'TAL-001',
        name: 'Taladro Bosch 700W',
        costPrice: 25000,
        salePrice: 35000,
        isActive: true,
        barcodes: [{ barcode: '7791234567890' }],
      },
    ];

    it('debería normalizar y calcular precios de venta a partir de costo y margen', () => {
      const rawRows = [
        {
          'Código': 'CEM-50',
          'Nombre del Producto': 'Cemento Loma Negra 50kg',
          'Costo': '8.000,00',
          'Margen %': '30',
          'Stock': '50',
          'IVA': '21',
        },
      ];

      const result = validateAndNormalizeProducts(rawRows, existingProducts);
      expect(result).toHaveLength(1);
      const row = result[0];

      expect(row.isValid).toBe(true);
      expect(row.sku).toBe('CEM-50');
      expect(row.name).toBe('Cemento Loma Negra 50kg');
      expect(row.costPrice).toBe(8000);
      expect(row.profitMargin).toBe(30);
      expect(row.salePrice).toBe(10400); // 8000 * 1.30
      expect(row.stock).toBe(50);
      expect(row.taxRate).toBe(21);
      expect(row.isExisting).toBe(false);
    });

    it('debería detectar productos existentes por SKU o Código de Barras', () => {
      const rawRows = [
        {
          'Código SKU': 'TAL-001',
          'Nombre': 'Taladro Percutor Bosch Actualizado',
          'Precio Venta': '42000',
        },
        {
          'Código de Barras': '7791234567890',
          'Nombre': 'Taladro por Código de Barra',
        },
      ];

      const result = validateAndNormalizeProducts(rawRows, existingProducts);
      expect(result[0].isExisting).toBe(true);
      expect(result[0].existingId).toBe('prod-100');
      expect(result[1].isExisting).toBe(true);
      expect(result[1].existingId).toBe('prod-100');
    });

    it('debería marcar como inválida una fila sin nombre de producto', () => {
      const rawRows = [
        {
          'Código': 'SIN-NOMBRE',
          'Precio': '1000',
        },
      ];

      const result = validateAndNormalizeProducts(rawRows);
      expect(result[0].isValid).toBe(false);
      expect(result[0].errors).toContain('El nombre del producto es obligatorio');
    });

    it('debería autogenerar SKU si el nombre está presente pero el código está vacío', () => {
      const rawRows = [
        {
          'Nombre': 'Tornillo Autoperforante 1 pulgada',
          'Precio': '150',
        },
      ];

      const result = validateAndNormalizeProducts(rawRows);
      expect(result[0].sku).toBeDefined();
      expect(result[0].sku.length).toBeGreaterThan(3);
    });
  });

  describe('validateAndNormalizeCustomers', () => {
    const existingCustomers: Customer[] = [
      {
        id: 'cust-1',
        name: 'Constructora del Plata SA',
        documentNum: '30-71234567-8',
        documentType: 'CUIT',
        taxCondition: 'RESPONSABLE_INSCRIPTO',
      } as Customer,
    ];

    it('debería normalizar clientes y detectar CUIT vs DNI automáticamente', () => {
      const rawRows = [
        {
          'Razón Social': 'Empresa Andina SRL',
          'CUIT/DNI': '30-68492012-3',
          'Condición IVA': 'Responsable Inscripto',
          'Teléfono': '11-4567-8901',
          'Límite de Crédito': '$ 500.000',
        },
        {
          'Nombre': 'Juan Carlos Vendedor',
          'Documento': '32.456.789',
          'Condición IVA': 'Consumidor Final',
        },
      ];

      const result = validateAndNormalizeCustomers(rawRows, existingCustomers);
      expect(result).toHaveLength(2);

      expect(result[0].documentType).toBe('CUIT');
      expect(result[0].taxCondition).toBe('RESPONSABLE_INSCRIPTO');
      expect(result[0].creditLimit).toBe(500000);
      expect(result[0].isExisting).toBe(false);

      expect(result[1].documentType).toBe('DNI');
      expect(result[1].taxCondition).toBe('CONSUMIDOR_FINAL');
    });

    it('debería identificar clientes duplicados por CUIT independientemente de guiones', () => {
      const rawRows = [
        {
          'Razón Social': 'Constructora del Plata SA (Actualización)',
          'CUIT': '30712345678', // Sin guiones
        },
      ];

      const result = validateAndNormalizeCustomers(rawRows, existingCustomers);
      expect(result[0].isExisting).toBe(true);
      expect(result[0].existingId).toBe('cust-1');
    });
  });

  describe('Plantillas de Descarga', () => {
    it('debería permitir llamar a downloadProductTemplate y downloadCustomerTemplate sin arrojar errores', () => {
      // Mock global window/document createElement para entorno jsdom
      expect(() => downloadProductTemplate('csv')).not.toThrow();
      expect(() => downloadCustomerTemplate('csv')).not.toThrow();
    });
  });
});
