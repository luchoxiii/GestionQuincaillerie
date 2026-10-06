import { describe, it, expect, beforeEach } from 'vitest';
import {
  sha256,
  computeAuditLogHash,
  verifyAuditChain,
  GENESIS_HASH,
  type AuditBlockData,
} from '@ferreteria/shared';
import {
  recordAuditLog,
  verifyLedgerIntegrity,
  getLocalAuditLogs,
} from '../services/audit.service';

describe('Forensic Inalterable Audit Ledger & SHA-256 Crypto (Bitácora Forense Criptográfica)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Motor Criptográfico SHA-256', () => {
    it('debe calcular el hash determinista SHA-256 estándar para cadena vacía', () => {
      // Valor estándar oficial NIST / FIPS 180-4 para string vacío
      const emptyHash = sha256('');
      expect(emptyHash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    });

    it('debe producir un hash determinista de 64 caracteres hexadecimales', () => {
      const hash1 = sha256('Ferretería ERP Industrial');
      const hash2 = sha256('Ferretería ERP Industrial');
      expect(hash1).toHaveLength(64);
      expect(hash1).toBe(hash2);
      expect(/^[0-9a-f]{64}$/.test(hash1)).toBe(true);
    });

    it('debe evidenciar efecto avalancha (avalanche effect): cambiar un carácter altera todo el hash', () => {
      const h1 = sha256('Cobro venta $50,000.00');
      const h2 = sha256('Cobro venta $50,000.01');
      expect(h1).not.toBe(h2);

      // Contar cuántos caracteres difieren
      let diffCount = 0;
      for (let i = 0; i < 64; i++) {
        if (h1[i] !== h2[i]) diffCount++;
      }
      expect(diffCount).toBeGreaterThan(30); // Más de la mitad del digest cambia drásticamente
    });
  });

  describe('computeAuditLogHash & verifyAuditChain', () => {
    it('debe encadenar bloques válidos secuencialmente desde el GENESIS_HASH', () => {
      const b1Data: AuditBlockData = {
        sequence: 1,
        timestamp: '2026-10-01T10:00:00.000Z',
        userId: 'u-admin',
        username: 'admin',
        action: 'CREATE',
        entity: 'User',
        entityId: 'u-1',
        description: 'Alta de operador cajero',
        details: { role: 'VENDEDOR' },
        ipAddress: '192.168.1.10',
        previousHash: GENESIS_HASH,
      };
      const b1Hash = computeAuditLogHash(b1Data);
      const b1 = { ...b1Data, hash: b1Hash };

      const b2Data: AuditBlockData = {
        sequence: 2,
        timestamp: '2026-10-01T10:15:00.000Z',
        userId: 'u-1',
        username: 'cajero',
        action: 'CREATE',
        entity: 'Sale',
        entityId: 'V-001',
        description: 'Venta mostrador de herramientas',
        details: { total: 45000 },
        ipAddress: '192.168.1.15',
        previousHash: b1Hash,
      };
      const b2Hash = computeAuditLogHash(b2Data);
      const b2 = { ...b2Data, hash: b2Hash };

      const result = verifyAuditChain([b1, b2]);
      expect(result.isValid).toBe(true);
      expect(result.totalVerified).toBe(2);
      expect(result.rootHash).toBe(b2Hash);
      expect(result.errorMessage).toBeUndefined();
    });

    it('debe detectar manipulación o adulteración en la carga de datos (tamper detection)', () => {
      const b1Data: AuditBlockData = {
        sequence: 1,
        timestamp: '2026-10-01T10:00:00.000Z',
        userId: 'u-admin',
        username: 'admin',
        action: 'CREATE',
        entity: 'Sale',
        entityId: 'V-100',
        description: 'Venta por $10,000.00',
        details: { total: 10000 },
        ipAddress: '192.168.1.10',
        previousHash: GENESIS_HASH,
      };
      const b1Hash = computeAuditLogHash(b1Data);
      const b1 = { ...b1Data, hash: b1Hash };

      // Simular un intento fraudulento de alterar el monto de la venta después de haber sido sellada
      const b1Adulterado = {
        ...b1,
        details: { total: 1000 }, // Intento de reducir el total para evasión
      };

      const result = verifyAuditChain([b1Adulterado]);
      expect(result.isValid).toBe(false);
      expect(result.errorIndex).toBe(0);
      expect(result.errorMessage).toContain('fue alterado o adulterado');
    });

    it('debe detectar la rotura de la cadena criptográfica (previousHash manipulado)', () => {
      const b1Data: AuditBlockData = {
        sequence: 1,
        timestamp: '2026-10-01T10:00:00.000Z',
        action: 'LOGIN',
        entity: 'Auth',
        entityId: 'sess-1',
        previousHash: GENESIS_HASH,
      };
      const b1 = { ...b1Data, hash: computeAuditLogHash(b1Data) };

      const b2Data: AuditBlockData = {
        sequence: 2,
        timestamp: '2026-10-01T10:05:00.000Z',
        action: 'CREATE',
        entity: 'Sale',
        entityId: 'V-2',
        previousHash: 'hash_falso_o_manipulado_0000000000000000000000000000000000000000000',
      };
      const b2 = { ...b2Data, hash: computeAuditLogHash(b2Data) };

      const result = verifyAuditChain([b1, b2]);
      expect(result.isValid).toBe(false);
      expect(result.errorIndex).toBe(1);
      expect(result.errorMessage).toContain('Cadena rota');
    });

    it('debe detectar eliminación de registros intermedios (discontinuidad de secuencia)', () => {
      const b1Data: AuditBlockData = {
        sequence: 1,
        timestamp: '2026-10-01T10:00:00.000Z',
        action: 'CREATE',
        entity: 'User',
        entityId: 'u-1',
        previousHash: GENESIS_HASH,
      };
      const b1 = { ...b1Data, hash: computeAuditLogHash(b1Data) };

      // Salto fraudulento: se borró el bloque #2 y se presenta directamente el bloque #3
      const b3Data: AuditBlockData = {
        sequence: 3,
        timestamp: '2026-10-01T10:30:00.000Z',
        action: 'BAN',
        entity: 'Customer',
        entityId: 'c-1',
        previousHash: b1.hash,
      };
      const b3 = { ...b3Data, hash: computeAuditLogHash(b3Data) };

      const result = verifyAuditChain([b1, b3]);
      expect(result.isValid).toBe(false);
      expect(result.errorIndex).toBe(1);
      expect(result.errorMessage).toContain('Discontinuidad en secuencia');
    });
  });

  describe('Servicio de Auditoría en Tiempo Real (audit.service)', () => {
    it('debe registrar un evento nuevo, encadenarlo automáticamente y mantener la cadena 100% íntegra', () => {
      const initialLogs = getLocalAuditLogs();
      const initialVerif = verifyLedgerIntegrity();
      expect(initialVerif.isValid).toBe(true);

      // Registrar una nueva acción de usuario
      const newEntry = recordAuditLog({
        userId: 'u-admin',
        user: 'Administrador',
        role: 'ADMIN',
        action: 'CREATE',
        entity: 'Store',
        entityId: 'suc-03',
        description: 'Alta de nueva sucursal comercial Norte',
        details: { code: 'SUC-03', posNumber: '0003' },
      });

      expect(newEntry.sequence).toBeGreaterThan(initialLogs.length);
      expect(newEntry.hash).toHaveLength(64);
      expect(newEntry.previousHash).toBe(initialVerif.lastHash);

      // Verificar que el ledger completo continúa siendo válido
      const afterVerif = verifyLedgerIntegrity();
      expect(afterVerif.isValid).toBe(true);
      expect(afterVerif.totalEntries).toBe(initialLogs.length + 1);
      expect(afterVerif.lastHash).toBe(newEntry.hash);
    });

    it('debe registrar altas de clientes, ventas mostrador y ajustes de stock con hashes encadenados', () => {
      // 1. Alta cliente
      const logCliente = recordAuditLog({
        userId: 'u-vendedor',
        user: 'Martín Vendedor',
        action: 'CREATE',
        entity: 'Customer',
        entityId: 'cust-999',
        description: 'Alta de cliente Corralón Mitre SA',
        details: { cuit: '30-71234567-9', creditLimit: 500000 },
      });

      // 2. Venta mostrador
      const logVenta = recordAuditLog({
        userId: 'u-vendedor',
        user: 'Martín Vendedor',
        action: 'CREATE',
        entity: 'Sale',
        entityId: 'V-0001-00009999',
        description: 'Venta por $120,000.00',
        details: { total: 120000, customerId: 'cust-999' },
      });

      // 3. Ajuste de stock
      const logStock = recordAuditLog({
        userId: 'u-deposito',
        user: 'Carlos Depósito',
        action: 'ADJUST',
        entity: 'Stock',
        entityId: 'PROD-TAL-01',
        description: 'Ajuste físico de 5 unidades por rotura',
        details: { type: 'OUT', quantity: 5 },
      });

      expect(logVenta.previousHash).toBe(logCliente.hash);
      expect(logStock.previousHash).toBe(logVenta.hash);

      const verif = verifyLedgerIntegrity();
      expect(verif.isValid).toBe(true);
      expect(verif.lastHash).toBe(logStock.hash);
    });
  });
});
