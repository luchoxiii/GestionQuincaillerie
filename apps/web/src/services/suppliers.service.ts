import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { recordAuditLog } from './audit.service';
import { useAuthStore } from '@/stores/auth.store';

export interface Supplier {
  id: string;
  name: string;
  cuit: string;
  taxCondition: string;
  phone?: string;
  email?: string;
  debtBalance: number;
}

const STORAGE_KEY_SUPPLIERS = 'ferreteria_local_suppliers';

const INITIAL_SUPPLIERS: Supplier[] = [
  { id: '1', name: 'Distribuidora Norte SA', cuit: '30-12345678-9', taxCondition: 'Responsable Inscripto', phone: '11-4567-8900', debtBalance: 150000 },
  { id: '2', name: 'Herramientas del Sur SRL', cuit: '33-87654321-9', taxCondition: 'Responsable Inscripto', phone: '11-4321-0098', debtBalance: 0 },
];

export const getLocalSuppliers = (): Supplier[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUPPLIERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(STORAGE_KEY_SUPPLIERS, JSON.stringify(INITIAL_SUPPLIERS));
  } catch (e) {
    console.error('Error reading localStorage for suppliers:', e);
  }
  return INITIAL_SUPPLIERS;
};

export const saveLocalSuppliers = (suppliers: Supplier[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_SUPPLIERS, JSON.stringify(suppliers));
  } catch (e) {
    console.error('Error saving localStorage for suppliers:', e);
  }
};

export const useSuppliers = (filters?: any) => {
  return useQuery({
    queryKey: ['suppliers', filters],
    queryFn: async () => {
      try {
        const { data } = await api.get('/suppliers', { params: filters });
        const list = Array.isArray(data) ? data : (data.data || []);
        if (list.length > 0) {
          saveLocalSuppliers(list);
          return list as Supplier[];
        }
      } catch (err) {
        // Backend offline, fallback to browser storage
      }
      return getLocalSuppliers();
    },
  });
};

export const useSupplier = (id: string) => {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/suppliers/${id}`);
        return data as Supplier;
      } catch (err) {
        const list = getLocalSuppliers();
        return list.find((s) => s.id === id) || null;
      }
    },
    enabled: !!id,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Supplier>) => {
      let created: any = null;
      try {
        const { data } = await api.post('/suppliers', payload);
        created = data;
      } catch (err) {
        console.warn('Backend offline, saving supplier locally');
      }

      const newSupplier: Supplier = {
        id: created?.id || 'sup-' + Date.now(),
        name: payload.name || 'Proveedor Sin Nombre',
        cuit: payload.cuit || '30-00000000-0',
        taxCondition: payload.taxCondition || 'Responsable Inscripto',
        phone: payload.phone || '',
        email: payload.email || '',
        debtBalance: payload.debtBalance || 0,
      };

      const list = getLocalSuppliers();
      saveLocalSuppliers([newSupplier, ...list]);
      return created || newSupplier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Supplier> & { id: string }) => {
      try {
        await api.put(`/suppliers/${id}`, payload);
      } catch (err) {
        console.warn('Backend offline, updating supplier locally');
      }

      const list = getLocalSuppliers();
      const index = list.findIndex((s) => s.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...payload };
        saveLocalSuppliers([...list]);
      }
      return { success: true };
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['supplier', id] });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.delete(`/suppliers/${id}`);
      } catch (err) {
        console.warn('Backend offline, deleting supplier locally');
      }

      const list = getLocalSuppliers();
      saveLocalSuppliers(list.filter((s) => s.id !== id));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};

export const useSupplierAccount = (id: string) => {
  return useQuery({
    queryKey: ['supplierAccount', id],
    queryFn: async () => {
      const moves: any[] = [];
      try {
        const purchasesRaw = localStorage.getItem('ferreteria_local_purchases');
        const purchases = purchasesRaw ? JSON.parse(purchasesRaw) : [];
        for (const p of purchases) {
          if (p.supplierId === id && p.status !== 'CANCELLED') {
            moves.push({
              id: p.id,
              date: p.date || new Date().toISOString().split('T')[0],
              type: 'COMPRA',
              amount: Number(p.total || 0),
              description: `Compra ${p.purchaseNumber} (Fact. ${p.invoiceNumber || 'S/N'})`,
            });
          }
        }
      } catch {}

      try {
        const supMovesRaw = localStorage.getItem('ferreteria_local_supplier_moves');
        const supMoves = supMovesRaw ? JSON.parse(supMovesRaw) : [];
        for (const m of supMoves) {
          if (m.supplierId === id) {
            moves.push({
              id: m.id,
              date: m.date || new Date().toISOString().split('T')[0],
              type: 'PAGO',
              amount: -Number(m.amount || 0),
              description: `${m.method || 'Pago'}${m.reference ? ` (${m.reference})` : ''}`,
            });
          }
        }
      } catch {}

      if (moves.length === 0) {
        return [
          { id: 'mov1', date: '2023-09-01', type: 'COMPRA', amount: 50000, description: 'Factura A-0001-00001234' },
          { id: 'mov2', date: '2023-09-10', type: 'PAGO', amount: -20000, description: 'Transferencia Bancaria' },
        ];
      }

      return moves.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    enabled: !!id,
  });
};

export const useRecordSupplierPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { supplierId: string; amount: number; method: string; date: string; reference?: string }) => {
      try {
        const { data } = await api.post(`/suppliers/${payload.supplierId}/payments`, payload);
        return data;
      } catch (err) {
        console.warn('Backend offline, recording supplier payment locally');
        const list = getLocalSuppliers();
        const index = list.findIndex((s) => s.id === payload.supplierId);
        let supplierName = 'Proveedor';
        if (index !== -1) {
          supplierName = list[index].name;
          list[index].debtBalance = Math.max(0, list[index].debtBalance - Number(payload.amount || 0));
          saveLocalSuppliers([...list]);
        }

        // Persist supplier payment history
        try {
          const supMovesRaw = localStorage.getItem('ferreteria_local_supplier_moves');
          const supMoves = supMovesRaw ? JSON.parse(supMovesRaw) : [];
          supMoves.unshift({
            id: 'smov-' + Date.now(),
            supplierId: payload.supplierId,
            supplierName,
            amount: Number(payload.amount || 0),
            method: payload.method,
            date: payload.date || new Date().toISOString().split('T')[0],
            reference: payload.reference || '',
          });
          localStorage.setItem('ferreteria_local_supplier_moves', JSON.stringify(supMoves));
        } catch {}

        // If paid in Cash, record cash OUT movement
        if (payload.method === 'Efectivo' || payload.method === 'CASH') {
          try {
            const cashRaw = localStorage.getItem('ferreteria_local_cash_session');
            const activeSession = cashRaw ? JSON.parse(cashRaw) : null;
            const movsRaw = localStorage.getItem('ferreteria_local_cash_movements');
            const movs = movsRaw ? JSON.parse(movsRaw) : [];
            movs.unshift({
              id: 'mov-sup-' + Date.now(),
              sessionId: activeSession?.id || 'sess-local',
              type: 'OUT',
              amount: Number(payload.amount || 0),
              description: `Pago a proveedor ${supplierName}${payload.reference ? ` (${payload.reference})` : ''}`,
              createdAt: new Date().toISOString(),
            });
            localStorage.setItem('ferreteria_local_cash_movements', JSON.stringify(movs));
          } catch {}
        }

        const currentUser = useAuthStore.getState().user;
        recordAuditLog({
          userId: currentUser?.id || 'u-encargado',
          username: currentUser?.username || 'encargado',
          user: currentUser?.name || 'Encargado',
          role: currentUser?.role || 'ENCARGADO',
          action: 'UPDATE',
          entity: 'Supplier',
          entityId: payload.supplierId,
          description: `Registró pago a proveedor ${supplierName} por $${Number(payload.amount || 0).toLocaleString()} (${payload.method})`,
          details: payload,
        });

        return { success: true };
      }
    },
    onSuccess: (_, { supplierId }) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['supplierAccount', supplierId] });
      queryClient.invalidateQueries({ queryKey: ['cash-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-movements'] });
    },
  });
};
