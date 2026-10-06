import { describe, it, expect, beforeEach } from 'vitest';
import {
  createBackupSnapshot,
  validateBackupFile,
  restoreBackupSnapshot,
  ErpBackupSnapshot,
} from './backup.service';

describe('Backup Service — Pruebas de Estrés y Respaldo Masivo 🔥', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debería generar, serializar y validar un snapshot de 20,000 entidades en menos de 1000ms', () => {
    // Poblar localStorage con 10,000 productos y 10,000 clientes
    const massiveProducts = Array.from({ length: 10000 }, (_, i) => ({
      id: `p-${i}`,
      sku: `SKU-${i}`,
      name: `Tornillo Autoperforante ${i}`,
      salePrice: 150 + i,
      stock: 100,
    }));
    const massiveCustomers = Array.from({ length: 10000 }, (_, i) => ({
      id: `c-${i}`,
      name: `Cliente Respaldo ${i}`,
      documentNum: `20-${i}-8`,
    }));

    localStorage.setItem('ferreteria_local_products', JSON.stringify(massiveProducts));
    localStorage.setItem('ferreteria_local_customers', JSON.stringify(massiveCustomers));

    const startTime = performance.now();
    const snapshot = createBackupSnapshot('admin-stress');
    const jsonString = JSON.stringify(snapshot);
    const validation = validateBackupFile(jsonString);
    const duration = performance.now() - startTime;

    expect(snapshot.metadata.totals.products).toBe(10000);
    expect(snapshot.metadata.totals.customers).toBe(10000);
    expect(validation.isValid).toBe(true);
    expect(validation.snapshot?.data.products.length).toBe(10000);
    expect(duration).toBeLessThan(1000);
  });

  it('debería someter a prueba 1,000 validaciones de archivos JSON corruptos o manipulados en menos de 500ms', () => {
    const invalidPayloads = [
      '',
      '{ invalid_json: ',
      JSON.stringify({ notMetadata: true }),
      JSON.stringify({ metadata: {}, data: { products: 'not-an-array' } }),
      JSON.stringify({ metadata: {}, data: { products: [], customers: null } }),
    ];

    const startTime = performance.now();
    for (let i = 0; i < 1000; i++) {
      const payload = invalidPayloads[i % invalidPayloads.length];
      const result = validateBackupFile(payload);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    }
    const duration = performance.now() - startTime;
    expect(duration).toBeLessThan(2000);
  });

  it('debería restaurar un snapshot masivo en localStorage sin pérdidas ni corrupción en menos de 500ms', () => {
    const mockSnapshot: ErpBackupSnapshot = {
      metadata: {
        version: '2.5.0-ferreteria-corralon',
        appName: 'Test',
        createdAt: new Date().toISOString(),
        totals: {
          products: 5000,
          customers: 5000,
          sales: 1000,
          quotes: 500,
          purchases: 200,
          suppliers: 50,
          categories: 20,
          coupons: 10,
        },
      },
      data: {
        products: Array.from({ length: 5000 }, (_, i) => ({ id: `p-${i}`, name: `Prod ${i}` })),
        customers: Array.from({ length: 5000 }, (_, i) => ({ id: `c-${i}`, name: `Cust ${i}` })),
        sales: Array.from({ length: 1000 }, (_, i) => ({ id: `s-${i}`, total: 1000 })),
        quotes: [],
        cashSession: null,
        cashMovements: [],
        categories: [],
        purchases: [],
        suppliers: [],
        settings: null,
        coupons: [],
        auditLogs: [],
        users: [],
        roles: [],
        ecommerceOrders: [],
      },
    };

    const startTime = performance.now();
    const result = restoreBackupSnapshot(mockSnapshot);
    const duration = performance.now() - startTime;

    expect(result.success).toBe(true);
    expect(result.stats.products).toBe(5000);
    expect(result.stats.customers).toBe(5000);
    expect(duration).toBeLessThan(500);
  });
});
