import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { recordAuditLog } from './audit.service';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';

export interface Store {
  id: string;
  name: string;
  code: string;
  address: string;
  city?: string;
  phone: string;
  email?: string;
  posNumber: string; // Punto de venta AFIP (0001, 0002, etc.)
  manager: string; // Encargado
  isMain: boolean; // Sucursal Principal
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type CreateStoreInput = Omit<Store, 'id' | 'createdAt' | 'updatedAt'>;

const STORAGE_KEY_STORES = 'ferreteria_local_stores';
const STORAGE_KEY_ACTIVE_STORE = 'ferreteria_active_store_id';

const INITIAL_STORES: Store[] = [
  {
    id: 'store-1',
    name: 'Casa Central (Mostrador Principal)',
    code: 'SUC-01',
    address: 'Av. Corrientes 1234, CABA',
    city: 'Buenos Aires',
    phone: '011-4567-8901',
    email: 'central@ferreteria.com',
    posNumber: '0001',
    manager: 'Carlos Gómez',
    isMain: true,
    isActive: true,
    notes: 'Sede central de atención mayorista y minorista con depósito central.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString(),
  },
  {
    id: 'store-2',
    name: 'Sucursal Sur (Lanús)',
    code: 'SUC-02',
    address: 'Calle San Martín 456, Lanús',
    city: 'Gran Buenos Aires',
    phone: '011-5678-9012',
    email: 'sur@ferreteria.com',
    posNumber: '0002',
    manager: 'Mariana Rossi',
    isMain: false,
    isActive: true,
    notes: 'Local comercial con showroom y retiro de pedidos e-commerce.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(),
  },
];

export const getLocalStores = (): Store[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STORES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_STORES;
};

export const saveLocalStores = (stores: Store[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_STORES, JSON.stringify(stores));
  } catch {}
};

export const getActiveStoreId = (): string => {
  try {
    const active = localStorage.getItem(STORAGE_KEY_ACTIVE_STORE);
    if (active) return active;
  } catch {}
  return 'store-1';
};

export const setActiveStoreId = (id: string) => {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_STORE, id);
    window.dispatchEvent(new Event('store_changed'));
  } catch {}
};

// React Query Hooks
export const useStores = () => {
  return useQuery<Store[]>({
    queryKey: ['stores'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/warehouses');
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Store[] = data.map((w: any, idx: number) => ({
            id: w.id,
            name: w.name,
            code: `SUC-0${idx + 1}`,
            address: w.address || 'Sin dirección',
            city: 'Buenos Aires',
            phone: '011-4000-0000',
            email: 'tienda@ferreteria.com',
            posNumber: String(idx + 1).padStart(4, '0'),
            manager: 'Encargado General',
            isMain: idx === 0,
            isActive: w.isActive !== false,
            createdAt: w.createdAt || new Date().toISOString(),
          }));
          saveLocalStores(mapped);
          return mapped;
        }
      } catch {}
      return getLocalStores();
    },
  });
};

export const useStore = (id: string) => {
  const { data: stores = [] } = useStores();
  return stores.find((s) => s.id === id) || null;
};

export const useActiveStore = () => {
  const { data: stores = [] } = useStores();
  const activeId = getActiveStoreId();
  const activeStore = stores.find((s) => s.id === activeId) || stores[0] || INITIAL_STORES[0];

  const changeStore = (newId: string) => {
    setActiveStoreId(newId);
    toast.success(`Tienda activa cambiada a: ${stores.find((s) => s.id === newId)?.name || newId}`);
  };

  return {
    activeStore,
    activeStoreId: activeStore?.id || 'store-1',
    changeStore,
  };
};

export const useCreateStore = () => {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore.getState().user;

  return useMutation({
    mutationFn: async (input: CreateStoreInput) => {
      const stores = getLocalStores();
      const newId = `store-${Date.now()}`;
      
      const newStore: Store = {
        ...input,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // If set as main, demote others
      let updatedList = [...stores];
      if (newStore.isMain) {
        updatedList = updatedList.map((s) => ({ ...s, isMain: false }));
      }
      updatedList.push(newStore);
      saveLocalStores(updatedList);

      try {
        await api.post('/warehouses', {
          name: newStore.name,
          address: `${newStore.address}${newStore.city ? `, ${newStore.city}` : ''}`,
          isActive: newStore.isActive,
        });
      } catch {}

      // Inalterable Audit Log
      recordAuditLog({
        action: 'CREATE',
        entity: 'Store',
        entityId: newStore.id,
        user: currentUser?.name || 'Administrador',
        userId: currentUser?.id || 'u-admin',
        username: currentUser?.username || 'admin',
        role: currentUser?.role || 'ADMIN',
        description: `Alta de nueva sucursal/tienda "${newStore.name}" (${newStore.code}) con Punto de Venta AFIP ${newStore.posNumber}`,
        details: {
          storeId: newStore.id,
          name: newStore.name,
          code: newStore.code,
          posNumber: newStore.posNumber,
          manager: newStore.manager,
          isMain: newStore.isMain,
          address: newStore.address,
        },
      });

      return newStore;
    },
    onSuccess: (createdStore) => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      toast.success(`Sucursal "${createdStore.name}" creada con éxito`);
    },
  });
};

export const useUpdateStore = () => {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore.getState().user;

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateStoreInput> }) => {
      const stores = getLocalStores();
      const index = stores.findIndex((s) => s.id === id);
      if (index === -1) throw new Error('Tienda no encontrada');

      const existing = stores[index];
      const updated: Store = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      };

      let updatedList = [...stores];
      if (updated.isMain) {
        updatedList = updatedList.map((s) => (s.id === id ? updated : { ...s, isMain: false }));
      } else {
        updatedList[index] = updated;
      }
      saveLocalStores(updatedList);

      try {
        await api.put(`/warehouses/${id}`, {
          name: updated.name,
          address: updated.address,
          isActive: updated.isActive,
        });
      } catch {}

      // Inalterable Audit Log
      recordAuditLog({
        action: 'UPDATE',
        entity: 'Store',
        entityId: updated.id,
        user: currentUser?.name || 'Administrador',
        userId: currentUser?.id || 'u-admin',
        username: currentUser?.username || 'admin',
        role: currentUser?.role || 'ADMIN',
        description: `Modificación de parámetros de la sucursal "${updated.name}" (${updated.code})`,
        details: {
          before: existing,
          after: updated,
        },
      });

      return updated;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      toast.success(`Sucursal "${updated.name}" actualizada con éxito`);
    },
  });
};

export const useDeleteStore = () => {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore.getState().user;

  return useMutation({
    mutationFn: async (id: string) => {
      const stores = getLocalStores();
      const store = stores.find((s) => s.id === id);
      if (!store) throw new Error('Tienda no encontrada');

      if (store.isMain) {
        throw new Error('No se puede desactivar la Casa Central / Sucursal Principal');
      }

      const updated = stores.map((s) => (s.id === id ? { ...s, isActive: false } : s));
      saveLocalStores(updated);

      try {
        await api.delete(`/warehouses/${id}`);
      } catch {}

      // Inalterable Audit Log
      recordAuditLog({
        action: 'DELETE',
        entity: 'Store',
        entityId: id,
        user: currentUser?.name || 'Administrador',
        userId: currentUser?.id || 'u-admin',
        username: currentUser?.username || 'admin',
        role: currentUser?.role || 'ADMIN',
        description: `Desactivación de sucursal "${store.name}" (${store.code})`,
        details: {
          storeId: id,
          name: store.name,
          status: 'INACTIVE',
        },
      });

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      toast.success('Sucursal desactivada correctamente');
    },
  });
};
