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

const INITIAL_WAREHOUSES: Warehouse[] = [
  { id: 'wh1', name: 'Depósito Principal', location: 'Av. Corrientes 123' },
  { id: 'wh2', name: 'Sucursal Sur', location: 'Belgrano 456' },
];

const INITIAL_STOCK = [
  { productId: 'prod-1', product: 'Taladro Percutor 700W Bosch GSB 13 RE', sku: 'TAL-001', warehouse: 'Depósito Principal', quantity: 15 },
  { productId: 'prod-2', product: 'Martillo Galponero Stanley Mango Fibra', sku: 'MAR-002', warehouse: 'Depósito Principal', quantity: 4 },
  { productId: 'prod-3', product: 'Amoladora Angular 4 1/2 DeWalt 820W', sku: 'AMO-003', warehouse: 'Depósito Principal', quantity: 8 },
];

const INITIAL_MOVEMENTS: StockMovement[] = [
  { id: 'mov-1', productId: 'prod-1', warehouseId: 'wh1', type: 'IN', product: 'Taladro Percutor 700W Bosch GSB 13 RE', quantity: 15, date: new Date(Date.now() - 86400000).toISOString(), reference: 'Recepción Inicial' },
  { id: 'mov-2', productId: 'prod-2', warehouseId: 'wh1', type: 'IN', product: 'Martillo Galponero Stanley Mango Fibra', quantity: 4, date: new Date(Date.now() - 86400000).toISOString(), reference: 'Recepción Inicial' },
];

const getLocalStock = () => {
  try {
    const raw = localStorage.getItem(STORAGE_STOCK_KEY);
    return raw ? JSON.parse(raw) : INITIAL_STOCK;
  } catch {
    return INITIAL_STOCK;
  }
};

const saveLocalStock = (stock: any[]) => {
  try {
    localStorage.setItem(STORAGE_STOCK_KEY, JSON.stringify(stock));
  } catch {}
};

const getLocalMovements = (): StockMovement[] => {
  try {
    const raw = localStorage.getItem(STORAGE_MOVEMENTS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_MOVEMENTS;
  } catch {
    return INITIAL_MOVEMENTS;
  }
};

const saveLocalMovements = (movements: StockMovement[]) => {
  try {
    localStorage.setItem(STORAGE_MOVEMENTS_KEY, JSON.stringify(movements));
  } catch {}
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
      let item = stock.find((s: any) => s.productId === payload.productId);
      if (item) {
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
          product: productName,
          sku: productSku,
          warehouse: 'Depósito Principal',
          quantity: payload.type === 'OUT' ? 0 : payload.quantity,
        };
        stock.push(item);
      }
      saveLocalStock([...stock]);

      // Update product totalStock in products list
      try {
        const prodsRaw = localStorage.getItem('ferreteria_local_products');
        if (prodsRaw) {
          const prods = JSON.parse(prodsRaw);
          const p = prods.find((x: any) => x.id === payload.productId);
          if (p) {
            if (payload.type === 'ADJUST') {
              p.totalStock = payload.quantity;
            } else if (payload.type === 'OUT') {
              p.totalStock = Math.max(0, (p.totalStock || 0) - payload.quantity);
            } else {
              p.totalStock = (p.totalStock || 0) + payload.quantity;
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
        warehouseId: payload.warehouseId,
        type: payload.type === 'OUT' ? 'OUT' : 'IN',
        product: productName,
        quantity: payload.type === 'OUT' ? -payload.quantity : payload.quantity,
        date: new Date().toISOString(),
        reference: payload.notes || (payload.type === 'ADJUST' ? 'Ajuste Exacto' : 'Ajuste Manual'),
      };
      saveLocalMovements([newMovement, ...movements]);

      // Audit Log Entry
      const actor = useAuthStore.getState().user?.name || 'Operador de Depósito';
      const actorId = useAuthStore.getState().user?.id || 'u-deposito';
      recordAuditLog({
        userId: actorId,
        user: actor,
        role: useAuthStore.getState().user?.role || 'DEPOSITO',
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
      const item = stock.find((s: any) => s.productId === payload.productId);
      if (item) {
        productName = item.product;
      }

      const movements = getLocalMovements();
      const newMovement: StockMovement = {
        id: 'mov-' + Date.now(),
        productId: payload.productId,
        warehouseId: payload.destinationWarehouseId,
        type: 'TRANSFER',
        product: productName,
        quantity: payload.quantity,
        date: new Date().toISOString(),
        reference: payload.notes || `Transferencia a ${payload.destinationWarehouseId}`,
      };
      saveLocalMovements([newMovement, ...movements]);

      // Audit Log Entry
      const actor = useAuthStore.getState().user?.name || 'Encargado de Depósito';
      const actorId = useAuthStore.getState().user?.id || 'u-deposito';
      recordAuditLog({
        userId: actorId,
        user: actor,
        role: useAuthStore.getState().user?.role || 'ENCARGADO',
        action: 'UPDATE',
        entity: 'Stock',
        entityId: payload.productId,
        description: `Transferencia inter-depósito de ${payload.quantity} u. de ${productName}`,
        details: payload,
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
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
