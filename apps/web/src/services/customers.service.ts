import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { Customer, matchCustomerNatural } from '@ferreteria/shared';
import { recordAuditLog } from './audit.service';
import { useAuthStore } from '@/stores/auth.store';

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
  taxCondition?: string;
}

export interface CustomerTransaction {
  id: string;
  date: string;
  type: 'SALE' | 'PAYMENT' | 'CREDIT_NOTE';
  reference: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface CustomerAccount {
  customer: Customer;
  transactions: CustomerTransaction[];
  totalBalance: number;
  availableCredit: number;
}

export interface RecordPaymentInput {
  amount: number;
  paymentMethod: string;
  reference?: string;
  notes?: string;
}

const STORAGE_KEY_CUSTOMERS = 'ferreteria_local_customers';

const INITIAL_CUSTOMERS: any[] = [
  {
    id: 'cust-1',
    name: 'Constructora del Plata SA',
    documentType: 'CUIT',
    documentNumber: '30-71234567-8',
    taxCondition: 'RESPONSABLE_INSCRIPTO',
    email: 'compras@constructoradelplata.com',
    phone: '11-4567-8901',
    address: 'Av. Corrientes 1234, CABA',
    creditLimit: 500000,
    currentBalance: 85000,
    isActive: true,
  },
  {
    id: 'cust-2',
    name: 'Roberto Gómez (Instalaciones)',
    documentType: 'DNI',
    documentNumber: '28.456.789',
    taxCondition: 'MONOTRIBUTO',
    email: 'rgomez.instalaciones@gmail.com',
    phone: '11-5678-9012',
    address: 'Calle San Martín 456, Lanús',
    creditLimit: 150000,
    currentBalance: 0,
    isActive: true,
  },
  {
    id: 'cust-3',
    name: 'Consumidor Final',
    documentType: 'DNI',
    documentNumber: '0',
    taxCondition: 'CONSUMIDOR_FINAL',
    email: '',
    phone: '',
    address: '',
    creditLimit: 0,
    currentBalance: 0,
    isActive: true,
    isBanned: false,
  },
  {
    id: 'cust-4',
    name: 'Distribuidora del Sur SRL (Inhabilitada)',
    documentType: 'CUIT',
    documentNumber: '30-65432109-7',
    taxCondition: 'RESPONSABLE_INSCRIPTO',
    email: 'contacto@delsursrl.com',
    phone: '11-3456-7890',
    address: 'Calle Falsa 789, Quilmes',
    creditLimit: 200000,
    currentBalance: 120000,
    isActive: true,
    isBanned: true,
    banReason: 'Cheques rebotados y mora de 90 días',
  },
];

const normalizeCustomer = (c: any): Customer => {
  const doc = c.documentNum || c.documentNumber || '';
  const bal = c.balance ?? c.currentBalance ?? 0;
  return {
    ...c,
    documentNum: doc,
    documentNumber: doc,
    balance: bal,
    currentBalance: bal,
    isBanned: Boolean(c.isBanned),
    banReason: c.banReason || '',
  } as Customer;
};

const getLocalCustomers = (): Customer[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOMERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeCustomer);
      }
    }
  } catch (e) {
    console.error('Error reading localStorage for customers:', e);
  }
  return INITIAL_CUSTOMERS.map(normalizeCustomer);
};

const saveLocalCustomers = (customers: Customer[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOMERS, JSON.stringify(customers));
  } catch (e) {
    console.error('Error saving localStorage for customers:', e);
  }
};

// Queries
export const useCustomers = (filters?: CustomerFilters) => {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: async () => {
      try {
        const { data } = await api.get<PaginatedResponse<Customer>>('/customers', {
          params: filters,
        });
        if (data && Array.isArray(data.data) && data.data.length > 0) {
          saveLocalCustomers(data.data);
          return data;
        }
      } catch (err) {
        // Backend offline, fallback to browser storage
      }

      let local = getLocalCustomers();
      if (filters?.search) {
        local = local.filter((c: any) => matchCustomerNatural(c, filters.search!));
      }
      return {
        data: local,
        meta: { total: local.length, page: 1, limit: 50, totalPages: 1 },
      };
    },
  });
};

export const useCustomer = (id: string | null) => {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const { data } = await api.get<Customer>(`/customers/${id}`);
        return data;
      } catch (err) {
        const list = getLocalCustomers();
        return (list.find((c: any) => c.id === id) as Customer) || null;
      }
    },
    enabled: !!id,
  });
};

export const useDebtors = () => {
  return useQuery({
    queryKey: ['customers', 'debtors'],
    queryFn: async () => {
      try {
        const { data } = await api.get<Customer[]>('/customers/debtors');
        return data;
      } catch (err) {
        const list = getLocalCustomers();
        return list.filter((c: any) => (c.currentBalance || 0) > 0);
      }
    },
  });
};

export const useCustomerAccount = (id: string | null) => {
  return useQuery({
    queryKey: ['customers', 'account', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const { data } = await api.get<CustomerAccount>(`/customers/${id}/account`);
        return data;
      } catch (err) {
        const list = getLocalCustomers();
        const customer = list.find((c: any) => c.id === id) || ({} as Customer);
        return {
          customer,
          transactions: [
            { id: 'tx-1', date: new Date().toISOString(), type: 'SALE', reference: 'FC-0001-00000123', debit: 45000, credit: 0, balance: 45000 },
          ],
          totalBalance: (customer as any).currentBalance || 0,
          availableCredit: Math.max(0, ((customer as any).creditLimit || 0) - ((customer as any).currentBalance || 0)),
        } as CustomerAccount;
      }
    },
    enabled: !!id,
  });
};

// Mutations
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customerData: Partial<Customer>) => {
      let created: any = null;
      try {
        const { data } = await api.post<Customer>('/customers', customerData);
        created = data;
      } catch (err) {
        console.warn('Backend offline, creating customer in browser storage');
      }

      const newCustomer: any = {
        id: created?.id || 'cust-' + Date.now(),
        name: customerData.name || 'Cliente Sin Nombre',
        documentType: customerData.documentType || 'DNI',
        documentNum: customerData.documentNum || (customerData as any).documentNumber || '',
        taxCondition: customerData.taxCondition || 'CONSUMIDOR_FINAL',
        email: customerData.email || '',
        phone: customerData.phone || '',
        address: customerData.address || '',
        creditLimit: Number(customerData.creditLimit || 0),
        currentBalance: 0,
        isActive: customerData.isActive !== false,
        isBanned: Boolean(customerData.isBanned),
        banReason: customerData.banReason || '',
        createdAt: new Date().toISOString(),
      };

      const list = getLocalCustomers();
      saveLocalCustomers([newCustomer, ...list]);

      // Audit log entry
      const actor = useAuthStore.getState().user?.name || 'Administrador Principal';
      const actorId = useAuthStore.getState().user?.id || 'u-admin';
      recordAuditLog({
        userId: actorId,
        user: actor,
        role: useAuthStore.getState().user?.role || 'ADMIN',
        action: 'CREATE',
        entity: 'Customer',
        entityId: newCustomer.id,
        description: `Alta de nuevo cliente: ${newCustomer.name} (${newCustomer.documentType} ${newCustomer.documentNum})`,
        details: {
          name: newCustomer.name,
          documentType: newCustomer.documentType,
          documentNum: newCustomer.documentNum,
          taxCondition: newCustomer.taxCondition,
          creditLimit: newCustomer.creditLimit,
        },
      });

      return created || newCustomer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useToggleBanCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isBanned, banReason }: { id: string; isBanned: boolean; banReason?: string }) => {
      try {
        await api.patch(`/customers/${id}`, { isBanned, banReason });
      } catch (err) {
        console.warn('Backend offline, toggling ban in browser storage');
      }

      const list = getLocalCustomers();
      const index = list.findIndex((c: any) => c.id === id);
      if (index !== -1) {
        list[index] = {
          ...list[index],
          isBanned,
          banReason: isBanned ? (banReason || 'Inhabilitado por administración') : '',
        };
        saveLocalCustomers([...list]);

        // Audit log entry
        const actor = useAuthStore.getState().user?.name || 'Administrador Principal';
        const actorId = useAuthStore.getState().user?.id || 'u-admin';
        recordAuditLog({
          userId: actorId,
          user: actor,
          role: useAuthStore.getState().user?.role || 'ADMIN',
          action: isBanned ? 'BAN' : 'UPDATE',
          entity: 'Customer',
          entityId: id,
          description: isBanned
            ? `Inhabilitó al cliente ${list[index].name} por: ${banReason || 'Decisión administrativa / mora'}`
            : `Levantó el veto / inhabilitación al cliente ${list[index].name}`,
          details: { id, customerName: list[index].name, isBanned, banReason },
        });
      }
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...customerData }: Partial<Customer> & { id: string }) => {
      try {
        await api.patch<Customer>(`/customers/${id}`, customerData);
      } catch (err) {
        console.warn('Backend offline, updating customer in browser storage');
      }

      const list = getLocalCustomers();
      const index = list.findIndex((c: any) => c.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...customerData };
        saveLocalCustomers([...list]);

        // Audit log entry
        const actor = useAuthStore.getState().user?.name || 'Administrador Principal';
        const actorId = useAuthStore.getState().user?.id || 'u-admin';
        recordAuditLog({
          userId: actorId,
          user: actor,
          role: useAuthStore.getState().user?.role || 'ADMIN',
          action: 'UPDATE',
          entity: 'Customer',
          entityId: id,
          description: `Actualizó datos de la ficha del cliente ${list[index].name}`,
          details: { id, customerName: list[index].name, changes: customerData },
        });
      }
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', variables.id] });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.delete(`/customers/${id}`);
      } catch (err) {
        console.warn('Backend offline, deactivating customer in browser storage');
      }

      const list = getLocalCustomers();
      const index = list.findIndex((c: any) => c.id === id);
      if (index !== -1) {
        (list[index] as any).isActive = false;
        saveLocalCustomers([...list]);

        // Audit log entry
        const actor = useAuthStore.getState().user?.name || 'Administrador Principal';
        const actorId = useAuthStore.getState().user?.id || 'u-admin';
        recordAuditLog({
          userId: actorId,
          user: actor,
          role: useAuthStore.getState().user?.role || 'ADMIN',
          action: 'DELETE',
          entity: 'Customer',
          entityId: id,
          description: `Desactivó / dió de baja la ficha del cliente ${(list[index] as any).name}`,
          details: { id, customerName: (list[index] as any).name, isActive: false },
        });
      }
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useRecordCustomerPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, payment }: { id: string; payment: RecordPaymentInput }) => {
      try {
        const { data } = await api.post(`/customers/${id}/payments`, payment);
        return data;
      } catch (err) {
        console.warn('Backend offline, recording payment in browser storage');
        const list = getLocalCustomers();
        const index = list.findIndex((c: any) => c.id === id);
        if (index !== -1) {
          (list[index] as any).currentBalance = Math.max(0, ((list[index] as any).currentBalance || 0) - payment.amount);
          saveLocalCustomers([...list]);
        }
        return { success: true };
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', 'account', variables.id] });
    },
  });
};
