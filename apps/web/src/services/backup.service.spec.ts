import { describe, it, expect, beforeEach } from 'vitest';
import {
  createBackupSnapshot,
  validateBackupFile,
  restoreBackupSnapshot,
  ErpBackupSnapshot,
} from './backup.service';

describe('ERP Backup & Restore Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debería generar un snapshot completo con metadatos y totales correctos', () => {
    localStorage.setItem(
      'ferreteria_local_products',
      JSON.stringify([{ id: 'p1', name: 'Martillo' }, { id: 'p2', name: 'Pinza' }])
    );
    localStorage.setItem(
      'ferreteria_local_customers',
      JSON.stringify([{ id: 'c1', name: 'Cliente Uno' }])
    );

    const snapshot = createBackupSnapshot('Operador Test');

    expect(snapshot).toBeDefined();
    expect(snapshot.metadata.appName).toContain('Ferretería');
    expect(snapshot.metadata.exportedBy).toBe('Operador Test');
    expect(snapshot.metadata.totals.products).toBe(2);
    expect(snapshot.metadata.totals.customers).toBe(1);
    expect(snapshot.data.products).toHaveLength(2);
    expect(snapshot.data.customers).toHaveLength(1);
  });

  describe('validateBackupFile', () => {
    it('debería validar positivamente un JSON de backup legítimo', () => {
      const validSnapshot: ErpBackupSnapshot = {
        metadata: {
          version: '2.5.0',
          appName: 'Ferretería ERP',
          createdAt: new Date().toISOString(),
          totals: {
            products: 1,
            customers: 1,
            sales: 0,
            quotes: 0,
            purchases: 0,
            suppliers: 0,
            categories: 0,
            coupons: 0,
          },
        },
        data: {
          products: [{ id: 'p1', name: 'Taladro' }],
          customers: [{ id: 'c1', name: 'Constructora' }],
          sales: [],
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

      const result = validateBackupFile(JSON.stringify(validSnapshot));
      expect(result.isValid).toBe(true);
      expect(result.snapshot).toBeDefined();
    });

    it('debería rechazar JSON corrupto o con estructura incompatible', () => {
      const corrupt = validateBackupFile('{ corrupt json invalid');
      expect(corrupt.isValid).toBe(false);

      const missingData = validateBackupFile(JSON.stringify({ someKey: 123 }));
      expect(missingData.isValid).toBe(false);
      expect(missingData.error).toContain('Estructura de copia de seguridad incompatible');
    });
  });

  describe('restoreBackupSnapshot', () => {
    it('debería restaurar todos los registros en el almacenamiento local y reportar estadísticas', () => {
      const backupToRestore: ErpBackupSnapshot = {
        metadata: {
          version: '2.5.0',
          appName: 'Ferretería ERP',
          createdAt: new Date().toISOString(),
          totals: {
            products: 1,
            customers: 1,
            sales: 0,
            quotes: 0,
            purchases: 0,
            suppliers: 0,
            categories: 0,
            coupons: 0,
          },
        },
        data: {
          products: [{ id: 'p-restored', name: 'Amoladora Restaurada' }],
          customers: [{ id: 'c-restored', name: 'Cliente Recuperado' }],
          sales: [],
          quotes: [],
          cashSession: null,
          cashMovements: [],
          categories: [{ id: 'cat-1', name: 'Maquinaria' }],
          purchases: [],
          suppliers: [],
          settings: { businessName: 'Ferretería Central' },
          coupons: [],
          auditLogs: [],
          users: [],
          roles: [],
          ecommerceOrders: [],
        },
      };

      const result = restoreBackupSnapshot(backupToRestore);

      expect(result.success).toBe(true);
      expect(result.stats.products).toBe(1);
      expect(result.stats.customers).toBe(1);
      expect(result.stats.categories).toBe(1);

      // Comprobar persistencia real en localStorage
      const storedProds = JSON.parse(localStorage.getItem('ferreteria_local_products')!);
      expect(storedProds[0].name).toBe('Amoladora Restaurada');
    });
  });
});
