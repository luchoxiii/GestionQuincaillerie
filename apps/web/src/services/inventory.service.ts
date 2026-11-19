import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { recordAuditLog } from './audit.service';
import { useAuthStore } from '@/stores/auth.store';

export interface Warehouse {
  id: string;
  name: string;
  location: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  warehouseId: string;
  type: 'IN' | 'OUT' | 'ADJUST' | 'TRANSFER';
  quantity: number;
  date: string;
  reference: string;
  notes?: string;
  product?: string;
}

const STORAGE_STOCK_KEY = 'ferreteria_local_stock';
const STORAGE_MOVEMENTS_KEY = 'ferreteria_local_stock_movements';
const STORAGE_TRANSFERS_KEY = 'ferreteria_local_transfers';

const INITIAL_WAREHOUSES: Warehouse[] = [
  { id: 'wh1', name: 'Depósito Principal', location: 'Av. Corrientes 123' },
  { id: 'wh2', name: 'Sucursal Sur', location: 'Belgrano 456' },
];

const INITIAL_STOCK = [
  { productId: 'prod-1', warehouseId: 'wh1', product: 'Taladro Percutor 700W Bosch GSB 13 RE', sku: 'TAL-001', warehouse: 'Depósito Principal', quantity: 15 },
  { productId: 'prod-2', warehouseId: 'wh1', product: 'Martillo Galponero Stanley Mango Fibra', sku: 'MAR-002', warehouse: 'Depósito Principal', quantity: 4 },
  { productId: 'prod-3', warehouseId: 'wh1', product: 'Amoladora Angular 4 1/2 DeWalt 820W', sku: 'AMO-003', warehouse: 'Depósito Principal', quantity: 8 },
];

const INITIAL_MOVEMENTS: StockMovement[] = [
  { id: 'mov-1', productId: 'prod-1', warehouseId: 'wh1', type: 'IN', product: 'Taladro Percutor 700W Bosch GSB 13 RE', quantity: 15, date: new Date(Date.now() - 86400000).toISOString(), reference: 'Recepción Inicial' },
  { id: 'mov-2', productId: 'prod-2', warehouseId: 'wh1', type: 'IN', product: 'Martillo Galponero Stanley Mango Fibra', quantity: 4, date: new Date(Date.now() - 86400000).toISOString(), reference: 'Recepción Inicial' },
];

export const getLocalStock = (): any[] => {
  try {
    const raw = localStorage.getItem(STORAGE_STOCK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(STORAGE_STOCK_KEY, JSON.stringify(INITIAL_STOCK));
  } catch {
    // ignore
  }
  return INITIAL_STOCK;
};

export const saveLocalStock = (stock: any[]) => {
  try {
    localStorage.setItem(STORAGE_STOCK_KEY, JSON.stringify(stock));
  } catch {}
};

export const getLocalMovements = (): StockMovement[] => {
  try {
    const raw = localStorage.getItem(STORAGE_MOVEMENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(STORAGE_MOVEMENTS_KEY, JSON.stringify(INITIAL_MOVEMENTS));
  } catch {
    // ignore
  }
  return INITIAL_MOVEMENTS;
};

export const saveLocalMovements = (movements: StockMovement[]) => {
  try {
    localStorage.setItem(STORAGE_MOVEMENTS_KEY, JSON.stringify(movements));
  } catch {}
};

const resolveWarehouseName = (warehouseId: string): string => {
  const foundWh = INITIAL_WAREHOUSES.find((w) => w.id === warehouseId);
  if (foundWh) return foundWh.name;
  try {
    const storesRaw = localStorage.getItem('ferreteria_local_stores');
    if (storesRaw) {
      const stores = JSON.parse(storesRaw);
      const foundStore = stores.find((s: any) => s.id === warehouseId);
      if (foundStore) return foundStore.name;
    }
  } catch {}
  return warehouseId || 'Depósito Principal';
};

export const useWarehouses = () => {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/inventory/warehouses');
        if (Array.isArray(data) && data.length > 0) return data;
      } catch {}
      return INITIAL_WAREHOUSES;
    },
  });
};

export const useWarehouse = (id: string) => {
  return useQuery({
    queryKey: ['warehouse', id],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/inventory/warehouses/${id}`);
        return data;
      } catch {
        return INITIAL_WAREHOUSES.find(w => w.id === id) || null;
      }
    },
    enabled: !!id,
  });
};

export const useStock = (filters?: any) => {
  return useQuery({
    queryKey: ['stock', filters],
    queryFn: async () => {
      try {
        const { data } = await api.get('/inventory/stock', { params: filters });
        if (Array.isArray(data) && data.length > 0) {
          saveLocalStock(data);
          return data;
        }
      } catch {}
      return getLocalStock();
    },
  });
};

export const useStockMovements = (filters?: any) => {
  return useQuery({
    queryKey: ['stockMovements', filters],
    queryFn: async () => {
      try {
        const { data } = await api.get('/inventory/movements', { params: filters });
        if (Array.isArray(data) && data.length > 0) {
          saveLocalMovements(data);
          return data;
        }
      } catch {}
      return getLocalMovements();
    },
  });
};

export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { productId: string; warehouseId: string; type: string; quantity: number; notes?: string }) => {
      try {
        const { data } = await api.post('/inventory/adjust', payload);
        return data;
      } catch (err) {
        console.warn('Backend offline, adjusting stock locally');
      }

      // Look up product info
      let productName = 'Artículo';
      let productSku = 'ART';
      let currentTotalStock = 0;
      try {
        const prodsRaw = localStorage.getItem('ferreteria_local_products');
        if (prodsRaw) {
          const prods = JSON.parse(prodsRaw);
          const p = prods.find((x: any) => x.id === payload.productId);
          if (p) {
            productName = p.name;
            productSku = p.sku || p.code || 'ART';
            currentTotalStock = p.totalStock ?? p.stock ?? 0;
          }
        }
      } catch {}

      // Update local stock
      const stock = getLocalStock();
      const targetWhId = payload.warehouseId || 'wh1';
      const targetWhName = resolveWarehouseName(targetWhId);
      let item = stock.find(
        (s: any) =>
          s.productId === payload.productId &&
          (s.warehouseId === targetWhId || (!s.warehouseId && targetWhId === 'wh1') || s.warehouse === targetWhName)
      );
      if (!item && !payload.warehouseId) {
        item = stock.find((s: any) => s.productId === payload.productId);
      }

      const oldQuantity = item ? Number(item.quantity || 0) : 0;
      if (item) {
        item.warehouseId = item.warehouseId || targetWhId;
        item.warehouse = item.warehouse || targetWhName;
        if (payload.type === 'ADJUST') {
          item.quantity = payload.quantity;
        } else if (payload.type === 'OUT') {
          item.quantity = Math.max(0, item.quantity - payload.quantity);
        } else {
          item.quantity = item.quantity + payload.quantity;
        }
      } else {
        item = {
          productId: payload.productId,
          warehouseId: targetWhId,
          product: productName,
          sku: productSku,
          warehouse: targetWhName,
          quantity: payload.type === 'OUT' ? 0 : payload.quantity,
        };
        stock.push(item);
      }
      saveLocalStock([...stock]);

      const diff = Number(item.quantity || 0) - oldQuantity;

      // Update product totalStock in products list
      try {
        const prodsRaw = localStorage.getItem('ferreteria_local_products');
        if (prodsRaw) {
          const prods = JSON.parse(prodsRaw);
          const p = prods.find((x: any) => x.id === payload.productId);
          if (p) {
            if (payload.type === 'ADJUST') {
              p.totalStock = Math.max(0, (p.totalStock ?? p.stock ?? 0) + diff);
            } else if (payload.type === 'OUT') {
              p.totalStock = Math.max(0, (p.totalStock ?? p.stock ?? 0) - payload.quantity);
            } else {
              p.totalStock = (p.totalStock ?? p.stock ?? 0) + payload.quantity;
            }
            p.stock = p.totalStock;
            localStorage.setItem('ferreteria_local_products', JSON.stringify(prods));
          }
        }
      } catch {}

      // Record movement
      const movements = getLocalMovements();
      const newMovement: StockMovement = {
        id: 'mov-' + Date.now(),
        productId: payload.productId,
        warehouseId: targetWhId,
        type: payload.type === 'OUT' ? 'OUT' : payload.type === 'ADJUST' ? 'ADJUST' : 'IN',
        product: productName,
        quantity: payload.type === 'OUT' ? -payload.quantity : payload.type === 'ADJUST' ? diff : payload.quantity,
        date: new Date().toISOString(),
        reference: payload.notes || (payload.type === 'ADJUST' ? 'Ajuste Exacto' : 'Ajuste Manual'),
      };
      saveLocalMovements([newMovement, ...movements]);

      // Audit Log Entry
      const currentUser = useAuthStore.getState().user;
      const actor = currentUser?.name || 'Operador de Depósito';
      const actorId = currentUser?.id || 'u-deposito';
      const actorUsername = currentUser?.username || 'deposito';
      recordAuditLog({
        userId: actorId,
        username: actorUsername,
        user: actor,
        role: currentUser?.role || 'DEPOSITO',
        action: 'ADJUST',
        entity: 'Stock',
        entityId: payload.productId,
        description: `Ajuste manual de existencias (${payload.type} ${payload.quantity} u.) en ${productName}`,
        details: {
          productId: payload.productId,
          productName,
          type: payload.type,
          quantity: payload.quantity,
          warehouseId: payload.warehouseId,
          notes: payload.notes,
        },
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useStockTransfers = () => {
  return useQuery({
    queryKey: ['stockTransfers'],
    queryFn: async () => {
      try {
        const raw = localStorage.getItem(STORAGE_TRANSFERS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
      return [];
    },
  });
};

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { sourceWarehouseId: string; destinationWarehouseId: string; productId: string; quantity: number; notes?: string }) => {
      try {
        const { data } = await api.post('/inventory/transfer', payload);
        return data;
      } catch (err) {
        console.warn('Backend offline, transferring stock locally');
      }

      const stock = getLocalStock();
      let productName = 'Artículo';
      let productSku = 'ART';
      try {
        const prodsRaw = localStorage.getItem('ferreteria_local_products');
        if (prodsRaw) {
          const prods = JSON.parse(prodsRaw);
          const p = prods.find((x: any) => x.id === payload.productId);
          if (p) {
            productName = p.name;
            productSku = p.sku || p.code || 'ART';
          }
        }
      } catch {}

      const srcWhName = resolveWarehouseName(payload.sourceWarehouseId);
      const dstWhName = resolveWarehouseName(payload.destinationWarehouseId);

      // Decrement source warehouse stock
      let srcItem = stock.find(
        (s: any) =>
          s.productId === payload.productId &&
          (s.warehouseId === payload.sourceWarehouseId ||
            (!s.warehouseId && payload.sourceWarehouseId === 'wh1') ||
            s.warehouse === srcWhName)
      );
      if (!srcItem) {
        srcItem = stock.find((s: any) => s.productId === payload.productId);
      }
      if (srcItem) {
        productName = srcItem.product || productName;
        productSku = srcItem.sku || productSku;
        srcItem.quantity = Math.max(0, Number(srcItem.quantity || 0) - Number(payload.quantity || 0));
      }

      // Increment destination warehouse stock
      let dstItem = stock.find(
        (s: any) =>
          s.productId === payload.productId &&
          (s.warehouseId === payload.destinationWarehouseId || s.warehouse === dstWhName)
      );
      if (dstItem) {
        dstItem.quantity = Number(dstItem.quantity || 0) + Number(payload.quantity || 0);
      } else {
        stock.push({
          productId: payload.productId,
          warehouseId: payload.destinationWarehouseId,
          product: productName,
          sku: productSku,
          warehouse: dstWhName,
          quantity: Number(payload.quantity || 0),
        });
      }
      saveLocalStock([...stock]);

      // Persist transfer history
      try {
        const transfersRaw = localStorage.getItem(STORAGE_TRANSFERS_KEY);
        const transfers = transfersRaw ? JSON.parse(transfersRaw) : [];
        transfers.unshift({
          id: 'trf-' + Date.now(),
          date: new Date().toISOString(),
          productId: payload.productId,
          productName,
          sku: productSku,
          sourceWarehouseId: payload.sourceWarehouseId,
          sourceWarehouseName: srcWhName,
          destinationWarehouseId: payload.destinationWarehouseId,
          destinationWarehouseName: dstWhName,
          quantity: payload.quantity,
          notes: payload.notes || '',
          status: 'COMPLETED',
        });
        localStorage.setItem(STORAGE_TRANSFERS_KEY, JSON.stringify(transfers));
      } catch {}

      const movements = getLocalMovements();
      const newMovement: StockMovement = {
        id: 'mov-' + Date.now(),
        productId: payload.productId,
        warehouseId: payload.destinationWarehouseId,
        type: 'TRANSFER',
        product: productName,
        quantity: payload.quantity,
        date: new Date().toISOString(),
        reference: payload.notes || `Transferencia de ${srcWhName} a ${dstWhName}`,
      };
      saveLocalMovements([newMovement, ...movements]);

      // Audit Log Entry
      const currentUser = useAuthStore.getState().user;
      const actor = currentUser?.name || 'Encargado de Depósito';
      const actorId = currentUser?.id || 'u-deposito';
      const actorUsername = currentUser?.username || 'deposito';
      recordAuditLog({
        userId: actorId,
        username: actorUsername,
        user: actor,
        role: currentUser?.role || 'ENCARGADO',
        action: 'UPDATE',
        entity: 'Stock',
        entityId: payload.productId,
        description: `Transferencia inter-depósito de ${payload.quantity} u. de ${productName} (${srcWhName} -> ${dstWhName})`,
        details: payload,
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['stockTransfers'] });
    },
  });
};

export const useInventoryCounts = () => {
  return useQuery({
    queryKey: ['inventoryCounts'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/inventory/counts');
        return data;
      } catch {
        return [];
      }
    },
  });
};

export const useCreateCount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      try {
        const { data } = await api.post('/inventory/counts', payload);
        return data;
      } catch {
        return { id: 'count-' + Date.now(), ...payload };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryCounts'] });
    },
  });
};

export const useApplyCount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { data } = await api.post(`/inventory/counts/${id}/apply`);
        return data;
      } catch {
        return { success: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryCounts'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
    },
  });
};
