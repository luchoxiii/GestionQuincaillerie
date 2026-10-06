import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import {
  extractSearchTokens,
  fieldMatchesToken,
  computeAuditLogHash,
  verifyAuditChain,
  GENESIS_HASH,
  type ChainableAuditEntry,
} from '@ferreteria/shared';

export interface AuditLog {
  id: string;
  sequence: number;
  previousHash: string;
  hash: string;
  timestamp: string;
  userId?: string;
  username?: string;
  user: string;
  role?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'VOID' | 'BAN' | 'ADJUST' | string;
  entity: string;
  entityId: string;
  description?: string;
  ipAddress: string;
  details: any;
}

const STORAGE_KEY_AUDIT = 'ferreteria_local_audit_logs';

// Raw seed events in chronological order (from oldest to newest)
const RAW_SEED_EVENTS: Omit<AuditLog, 'sequence' | 'previousHash' | 'hash'>[] = [
  {
    id: 'log-seed-1',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    userId: 'u-deposito',
    username: 'deposito',
    user: 'Carlos López',
    role: 'DEPOSITO',
    action: 'CREATE',
    entity: 'Stock',
    entityId: 'REC-0028',
    description: 'Recepción y estibado de 40 bolsas de Cemento Loma Negra 50kg',
    ipAddress: '192.168.1.20',
    details: { units: 40, location: 'Galpón Principal - Bahía 4' }
  },
  {
    id: 'log-seed-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 400).toISOString(),
    userId: 'u-cajero',
    username: 'cajero',
    user: 'Juan Pérez',
    role: 'VENDEDOR',
    action: 'CREATE',
    entity: 'Sale',
    entityId: 'V-0001-00000099',
    description: 'Cobró venta mostrador por $12,300.00 (Ticket Débito)',
    ipAddress: '192.168.1.10',
    details: { total: 12300, paymentMethod: 'Débito' }
  },
  {
    id: 'log-seed-3',
    timestamp: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
    userId: 'u-deposito',
    username: 'deposito',
    user: 'Carlos López',
    role: 'DEPOSITO',
    action: 'UPDATE',
    entity: 'Stock',
    entityId: 'INV-STK-092',
    description: 'Ajuste de inventario físico en estantería C-3 (Tornillos autoperforantes)',
    ipAddress: '192.168.1.20',
    details: { adjustment: +150, physicalCount: 850 }
  },
  {
    id: 'log-seed-4',
    timestamp: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
    userId: 'u-encargado',
    username: 'encargado',
    user: 'Martín Gómez',
    role: 'ENCARGADO',
    action: 'VOID',
    entity: 'Sale',
    entityId: 'V-0001-00000104',
    description: 'Anuló comprobante de venta por error de carga en mostrador',
    ipAddress: '192.168.1.15',
    details: { saleId: 'sale-4', total: 38720, reason: 'Duplicado por cajero' }
  },
  {
    id: 'log-seed-5',
    timestamp: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    userId: 'u-encargado',
    username: 'encargado',
    user: 'Martín Gómez',
    role: 'ENCARGADO',
    action: 'CREATE',
    entity: 'Purchase',
    entityId: 'OC-2026-0045',
    description: 'Emitió orden de compra a Bulonera del Norte SA',
    ipAddress: '192.168.1.15',
    details: { supplier: 'Bulonera del Norte SA', total: 185000, itemsCount: 14 }
  },
  {
    id: 'log-seed-6',
    timestamp: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    userId: 'u-admin',
    username: 'admin',
    user: 'Administrador Principal',
    role: 'ADMIN',
    action: 'UPDATE',
    entity: 'Product',
    entityId: 'TL-001',
    description: 'Actualizó margen de ganancia y precio de Taladro Percutor 700W',
    ipAddress: '192.168.1.5',
    details: { price: { old: 22000, new: 24500 }, margin: { old: 35, new: 40 } }
  },
  {
    id: 'log-seed-7',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    userId: 'u-cajero',
    username: 'cajero',
    user: 'Juan Pérez',
    role: 'VENDEDOR',
    action: 'CREATE',
    entity: 'Cash',
    entityId: 'CAJA-01',
    description: 'Apertura de turno de caja con saldo inicial de $25,000.00',
    ipAddress: '192.168.1.10',
    details: { initialCash: 25000, shift: 'Mañana' }
  },
  {
    id: 'log-seed-8',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    userId: 'u-cajero',
    username: 'cajero',
    user: 'Juan Pérez',
    role: 'VENDEDOR',
    action: 'CREATE',
    entity: 'Sale',
    entityId: 'V-0001-00000101',
    description: 'Cobró venta mostrador por $54,450.00 (Factura B) con cupón BIENVENIDA10',
    ipAddress: '192.168.1.10',
    details: { total: 54450, customer: 'Constructora del Plata SA', paymentMethod: 'Efectivo', coupon: 'BIENVENIDA10', discount: 6050 }
  },
  {
    id: 'log-seed-9',
    timestamp: new Date().toISOString(),
    userId: 'u-admin',
    username: 'admin',
    user: 'Administrador Principal',
    role: 'ADMIN',
    action: 'BAN',
    entity: 'Customer',
    entityId: 'cust-4',
    description: 'Inhabilitó al cliente Distribuidora del Sur SRL por cheques rebotados',
    ipAddress: '192.168.1.5',
    details: { reason: 'Cheques rebotados y mora de 90 días', status: 'BANNED' }
  }
];

// Helper to generate a verified cryptographic chain from raw events
function buildSeededChain(rawEvents: typeof RAW_SEED_EVENTS): AuditLog[] {
  let prevHash = GENESIS_HASH;
  const result: AuditLog[] = [];

  for (let i = 0; i < rawEvents.length; i++) {
    const raw = rawEvents[i];
    const sequence = i + 1;
    const chainEntry: ChainableAuditEntry = {
      sequence,
      previousHash: prevHash,
      timestamp: raw.timestamp,
      userId: raw.userId,
      username: raw.username,
      user: raw.user,
      role: raw.role,
      action: raw.action,
      entity: raw.entity,
      entityId: raw.entityId,
      description: raw.description,
      ipAddress: raw.ipAddress,
      details: raw.details,
    };
    const hash = computeAuditLogHash(chainEntry);
    prevHash = hash;

    result.push({
      ...raw,
      sequence,
      previousHash: chainEntry.previousHash,
      hash,
    });
  }

  // Return in descending order (most recent first) for UI presentation
  return result.reverse();
}

const INITIAL_AUDIT_LOGS: AuditLog[] = buildSeededChain(RAW_SEED_EVENTS);

export const getLocalAuditLogs = (): AuditLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDIT);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return INITIAL_AUDIT_LOGS;
};

export const saveLocalAuditLogs = (logs: AuditLog[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(logs));
  } catch {}
};

/**
 * Record a new tamper-evident audit event with SHA-256 cryptographic chaining.
 */
export const recordAuditLog = (
  logEntry: Omit<AuditLog, 'id' | 'sequence' | 'previousHash' | 'hash' | 'timestamp' | 'ipAddress'> & {
    ipAddress?: string;
    timestamp?: string;
  }
): AuditLog => {
  const currentLogs = getLocalAuditLogs();
  
  // Find highest sequence and corresponding tip hash
  let highestSequence = 0;
  let tipHash = GENESIS_HASH;

  for (const log of currentLogs) {
    if (log.sequence > highestSequence) {
      highestSequence = log.sequence;
      tipHash = log.hash;
    }
  }

  const sequence = highestSequence + 1;
  const timestamp = logEntry.timestamp || new Date().toISOString();
  const ipAddress = logEntry.ipAddress || '192.168.1.5';

  const chainable: ChainableAuditEntry = {
    sequence,
    previousHash: tipHash,
    timestamp,
    userId: logEntry.userId,
    username: logEntry.username,
    user: logEntry.user,
    role: logEntry.role,
    action: logEntry.action,
    entity: logEntry.entity,
    entityId: logEntry.entityId,
    description: logEntry.description,
    ipAddress,
    details: logEntry.details,
  };

  const hash = computeAuditLogHash(chainable);

  const newLog: AuditLog = {
    id: 'log-' + Date.now() + '-' + sequence,
    sequence,
    previousHash: tipHash,
    hash,
    timestamp,
    ipAddress,
    ...logEntry,
  };

  // Prepend to list (most recent first for UI)
  saveLocalAuditLogs([newLog, ...currentLogs]);
  return newLog;
};

/**
 * Validate the complete audit ledger cryptographic chain.
 * Re-computes SHA-256 hashes sequentially and checks for any tampering, missing entries or order alterations.
 */
export const verifyLedgerIntegrity = (): {
  isValid: boolean;
  totalEntries: number;
  tamperedIndex?: number;
  reason?: string;
  lastHash?: string;
} => {
  const logs = getLocalAuditLogs();
  if (logs.length === 0) {
    return { isValid: true, totalEntries: 0, lastHash: GENESIS_HASH };
  }

  // Sort ascending by sequence for verification
  const sorted = [...logs].sort((a, b) => a.sequence - b.sequence);

  const result = verifyAuditChain(sorted as any);
  return {
    isValid: result.isValid,
    totalEntries: sorted.length,
    tamperedIndex: result.errorIndex,
    reason: result.errorMessage,
    lastHash: result.rootHash || sorted[sorted.length - 1]?.hash,
  };
};

export const useAuditLogs = (filters?: {
  entity?: string;
  action?: string;
  user?: string;
  search?: string;
  userId?: string;
}) => {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      try {
        const { data } = await api.get<AuditLog[]>('/audit-logs', { params: filters });
        if (Array.isArray(data) && data.length > 0) {
          saveLocalAuditLogs(data);
          return data;
        }
      } catch (err) {
        // Fallback to local storage
      }

      let list = getLocalAuditLogs();

      if (filters?.userId && filters.userId !== 'all') {
        list = list.filter((l) => l.userId === filters.userId || l.username === filters.userId);
      }
      if (filters?.entity && filters.entity !== 'all') {
        list = list.filter((l) => l.entity === filters.entity);
      }
      if (filters?.action && filters.action !== 'all') {
        list = list.filter((l) => l.action === filters.action);
      }
      if (filters?.user && filters.user !== 'all') {
        list = list.filter((l) => l.user === filters.user || l.username === filters.user);
      }
      if (filters?.search) {
        const tokens = extractSearchTokens(filters.search);
        if (tokens.length > 0) {
          list = list.filter((l) =>
            tokens.every(
              (tok) =>
                fieldMatchesToken(l.user, tok) ||
                fieldMatchesToken(l.username, tok) ||
                fieldMatchesToken(l.entity, tok) ||
                fieldMatchesToken(l.entityId, tok) ||
                fieldMatchesToken(l.description, tok) ||
                fieldMatchesToken(l.ipAddress, tok) ||
                fieldMatchesToken(l.hash, tok) ||
                fieldMatchesToken(String(l.sequence), tok)
            )
          );
        }
      }

      return list;
    },
  });
};

export const useUserAuditLogs = (
  userIdOrUsername?: string,
  filters?: { action?: string; entity?: string; search?: string }
) => {
  return useQuery({
    queryKey: ['audit-logs-user', userIdOrUsername, filters],
    queryFn: async () => {
      if (!userIdOrUsername) return [];
      const allLogs = getLocalAuditLogs();
      const target = userIdOrUsername.toLowerCase();

      let userLogs = allLogs.filter(
        (l) =>
          (l.userId && l.userId.toLowerCase() === target) ||
          (l.username && l.username.toLowerCase() === target) ||
          l.user.toLowerCase().includes(target)
      );

      if (filters?.action && filters.action !== 'all') {
        userLogs = userLogs.filter((l) => l.action === filters.action);
      }
      if (filters?.entity && filters.entity !== 'all') {
        userLogs = userLogs.filter((l) => l.entity === filters.entity);
      }
      if (filters?.search) {
        const tokens = extractSearchTokens(filters.search);
        if (tokens.length > 0) {
          userLogs = userLogs.filter((l) =>
            tokens.every(
              (tok) =>
                fieldMatchesToken(l.entity, tok) ||
                fieldMatchesToken(l.entityId, tok) ||
                fieldMatchesToken(l.description, tok) ||
                fieldMatchesToken(l.ipAddress, tok) ||
                fieldMatchesToken(l.action, tok) ||
                fieldMatchesToken(l.hash, tok) ||
                fieldMatchesToken(String(l.sequence), tok)
            )
          );
        }
      }

      return userLogs;
    },
    enabled: !!userIdOrUsername,
  });
};

