import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { getLocalProducts } from './products.service';
import { getLocalSuppliers } from './suppliers.service';
import { getLocalStock } from './inventory.service';
import { recordAuditLog } from './audit.service';
import { useAuthStore } from '@/stores/auth.store';

export interface PurchaseItem {
  productId: string;
  quantity: number;
  unitCost: number;
  taxRate: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  invoiceNumber: string;
  supplierId: string;
  supplier?: string;
  destinationWarehouseId: string;
  date: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  total: number;
  items: PurchaseItem[];
  updateSellingPrices?: boolean;
}

const STORAGE_PURCHASES_KEY = 'ferreteria_local_purchases';

const INITIAL_PURCHASES: Purchase[] = [
  { id: '1', purchaseNumber: 'C-001', invoiceNumber: 'A-0001-00001234', supplierId: '1', supplier: 'Distribuidora Norte SA', destinationWarehouseId: 'wh1', date: '2023-10-10', total: 125000, status: 'COMPLETED', items: [] },
  { id: '2', purchaseNumber: 'C-002', invoiceNumber: 'B-0002-00009876', supplierId: '2', supplier: 'Herramientas del Sur SRL', destinationWarehouseId: 'wh1', date: '2023-10-11', total: 45000, status: 'PENDING', items: [] },
];

export const getLocalPurchases = (): Purchase[] => {
  try {
    const raw = localStorage.getItem(STORAGE_PURCHASES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(STORAGE_PURCHASES_KEY, JSON.stringify(INITIAL_PURCHASES));
  } catch (e) {
    console.error('Error reading localStorage for purchases:', e);
  }
  return INITIAL_PURCHASES;
};

const saveLocalPurchases = (purchases: Purchase[]) => {
  try {
    localStorage.setItem(STORAGE_PURCHASES_KEY, JSON.stringify(purchases));
  } catch (e) {
    console.error('Error saving localStorage for purchases:', e);
  }
};

export const usePurchases = (filters?: any) => {
  return useQuery({
    queryKey: ['purchases', filters],
    queryFn: async () => {
      try {
        const { data } = await api.get('/purchases', { params: filters });
        const list = Array.isArray(data) ? data : (data.data || []);
        if (list.length > 0) {
          saveLocalPurchases(list);
          return list as Purchase[];
        }
      } catch (err) {
        // Backend offline, fallback
      }
      return getLocalPurchases();
    },
  });
};

export const usePurchase = (id: string) => {
  return useQuery({
    queryKey: ['purchase', id],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/purchases/${id}`);
        return data;
      } catch {
        const list = getLocalPurchases();
        return list.find((p) => p.id === id) || null;
      }
    },
    enabled: !!id,
  });
};

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Purchase> & { paymentMethod?: string; initialPaymentAmount?: number }) => {
      let created: any = null;
      try {
        const { data } = await api.post('/purchases', payload);
        created = data;
      } catch (err) {
        console.warn('Backend offline, saving purchase in browser storage');
      }

      const list = getLocalPurchases();
      const sups = getLocalSuppliers();
      const prods = getLocalProducts();
      
      // Resolve supplier name
      let supplierName = 'Proveedor General';
      const foundSup = sups.find((s: any) => s.id === payload.supplierId);
      if (foundSup) supplierName = foundSup.name;

      const newPurchase: Purchase = {
        id: created?.id || 'pur-' + Date.now(),
        purchaseNumber: `C-${String(list.length + 1).padStart(3, '0')}`,
        invoiceNumber: payload.invoiceNumber || 'REC-0001',
        supplierId: payload.supplierId || '',
        supplier: supplierName,
        destinationWarehouseId: payload.destinationWarehouseId || 'wh1',
        date: payload.date || new Date().toISOString().split('T')[0],
        status: (payload.status as any) || 'COMPLETED',
        total: payload.total || 0,
        items: payload.items || [],
        updateSellingPrices: payload.updateSellingPrices,
      };

      saveLocalPurchases([newPurchase, ...list]);

      // Update products stock & prices
      try {
        if (payload.items) {
          for (const item of payload.items) {
            const p = prods.find((prod: any) => prod.id === item.productId);
            if (p) {
              const currentStock = p.totalStock ?? p.stock ?? 0;
              p.totalStock = currentStock + (item.quantity || 0);
              p.stock = p.totalStock;

              if (item.unitCost > 0) {
                p.costPrice = item.unitCost;
                if (payload.updateSellingPrices) {
                  const margin = p.profitMargin ?? 35;
                  p.salePrice = Math.round(item.unitCost * (1 + margin / 100) * 100) / 100;
                  p.price = p.salePrice;
                }
              }
            }
          }
          localStorage.setItem('ferreteria_local_products', JSON.stringify(prods));
        }
      } catch (e) {
        console.error('Error updating products stock on purchase:', e);
      }

      // Update warehouse stock & Kardex
      try {
        const stockList = getLocalStock();
        const movsRaw = localStorage.getItem('ferreteria_local_stock_movements');
        const movsList = movsRaw ? JSON.parse(movsRaw) : [];

        if (payload.items) {
          for (const item of payload.items) {
            const p = prods.find((prod: any) => prod.id === item.productId);
            const prodName = p?.name || 'Artículo';
            const prodSku = p?.sku || p?.code || 'ART';
            const s = stockList.find((st: any) => st.productId === item.productId);
            if (s) {
              s.quantity = (s.quantity || 0) + item.quantity;
            } else {
              stockList.push({
                productId: item.productId,
                warehouseId: payload.destinationWarehouseId || 'wh1',
                product: prodName,
                sku: prodSku,
                warehouse: 'Depósito Principal',
                quantity: item.quantity,
              });
            }

            movsList.unshift({
              id: 'mov-' + Date.now() + '-' + Math.random().toString(36).substring(7),
              productId: item.productId,
              warehouseId: payload.destinationWarehouseId || 'wh1',
              type: 'IN',
              product: prodName,
              quantity: item.quantity,
              date: new Date().toISOString(),
              reference: `Compra ${newPurchase.purchaseNumber} (Fact. ${newPurchase.invoiceNumber})`,
            });
          }
          localStorage.setItem('ferreteria_local_stock', JSON.stringify(stockList));
          localStorage.setItem('ferreteria_local_stock_movements', JSON.stringify(movsList));
        }
      } catch (e) {
        console.error('Error updating stock/movements on purchase:', e);
      }

      // Update supplier debt if Cuenta Corriente
      if (payload.paymentMethod === 'Cuenta Corriente' && payload.supplierId) {
        try {
          const sup = sups.find((s: any) => s.id === payload.supplierId);
          if (sup) {
            sup.debtBalance = (sup.debtBalance || 0) + (payload.total || 0);
            localStorage.setItem('ferreteria_local_suppliers', JSON.stringify(sups));
          }
        } catch {}
      }

      // Record cash egreso if paid in cash
      if (payload.paymentMethod === 'Efectivo') {
        try {
          const cashRaw = localStorage.getItem('ferreteria_local_cash_session');
          const activeSession = cashRaw ? JSON.parse(cashRaw) : null;
          const movsKey = 'ferreteria_local_cash_movements';
          const curMovsRaw = localStorage.getItem(movsKey);
          const curMovs = curMovsRaw ? JSON.parse(curMovsRaw) : [];
          curMovs.unshift({
            id: 'cmov-' + Date.now(),
            sessionId: activeSession?.id || 'sess-local',
            type: 'OUT',
            amount: payload.initialPaymentAmount || payload.total || 0,
            description: `Pago compra ${newPurchase.purchaseNumber} (${supplierName})`,
            createdAt: new Date().toISOString(),
          });
          localStorage.setItem(movsKey, JSON.stringify(curMovs));
        } catch {}
      }

      // Record Audit Log
      const currentUser = useAuthStore.getState().user;
      recordAuditLog({
        userId: currentUser?.id || 'u-encargado',
        username: currentUser?.username || 'encargado',
        user: currentUser?.name || 'Encargado de Compras',
        role: currentUser?.role || 'ENCARGADO',
        action: 'CREATE',
        entity: 'Purchase',
        entityId: newPurchase.id,
        description: `Registró compra ${newPurchase.purchaseNumber} (Fact. ${newPurchase.invoiceNumber}) a ${supplierName} por $${(newPurchase.total || 0).toLocaleString()}`,
        details: {
          purchaseNumber: newPurchase.purchaseNumber,
          invoiceNumber: newPurchase.invoiceNumber,
          supplierId: newPurchase.supplierId,
          supplier: supplierName,
          total: newPurchase.total,
          paymentMethod: payload.paymentMethod,
          itemsCount: newPurchase.items?.length || 0,
        },
      });

      return created || newPurchase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['cash-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-movements'] });
    },
  });
};

export const usePurchaseOrders = (filters?: any) => {
  return useQuery({
    queryKey: ['purchaseOrders', filters],
    queryFn: async () => {
      try {
        const { data } = await api.get('/purchases/orders', { params: filters });
        return data;
      } catch {
        return [];
      }
    },
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      try {
        const { data } = await api.post('/purchases/orders', payload);
        return data;
      } catch {
        return { id: 'po-' + Date.now(), ...payload };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
    },
  });
};
