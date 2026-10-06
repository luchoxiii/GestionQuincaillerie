import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { CashSession, CashMovement, CashRegister } from '@ferreteria/shared';

const STORAGE_SESSION_KEY = 'ferreteria_local_cash_session';
const STORAGE_MOVEMENTS_KEY = 'ferreteria_local_cash_movements';
const STORAGE_REGISTERS_KEY = 'ferreteria_local_cash_registers';

const DEFAULT_REGISTERS: any[] = [
  { id: 'reg-1', name: 'Caja Principal 01', pointOfSale: '0001', isActive: true },
  { id: 'reg-2', name: 'Caja Mostrador 02', pointOfSale: '0002', isActive: true },
];

const getLocalSession = (): any | null => {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveLocalSession = (session: any | null) => {
  try {
    if (session) {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    }
  } catch {}
};

const getLocalMovements = (): any[] => {
  try {
    const raw = localStorage.getItem(STORAGE_MOVEMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalMovements = (movements: any[]) => {
  try {
    localStorage.setItem(STORAGE_MOVEMENTS_KEY, JSON.stringify(movements));
  } catch {}
};

export const useCurrentCashSession = () => {
  return useQuery({
    queryKey: ['cash-sessions', 'current'],
    queryFn: async () => {
      try {
        const { data } = await api.get<CashSession | null>('/cash-sessions/current');
        if (data) {
          saveLocalSession(data);
          return data;
        }
      } catch (err) {
        // Backend offline, fallback to local storage
      }
      return getLocalSession();
    },
  });
};

export const useOpenCashSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { registerId: string; openingBalance: number; notes?: string }) => {
      let created: any = null;
      try {
        const { data } = await api.post<CashSession>('/cash-sessions/open', payload);
        created = data;
      } catch (err) {
        console.warn('Backend offline, opening cash session locally');
      }

      const newSession = created || {
        id: 'sess-' + Date.now(),
        registerId: payload.registerId,
        openingBalance: Number(payload.openingBalance),
        openedAt: new Date().toISOString(),
        notes: payload.notes || '',
        status: 'OPEN',
      };

      saveLocalSession(newSession);
      saveLocalMovements([
        {
          id: 'mov-' + Date.now(),
          sessionId: newSession.id,
          type: 'IN',
          amount: Number(payload.openingBalance),
          description: 'Apertura de caja (Fondo inicial)',
          createdAt: new Date().toISOString(),
        }
      ]);

      return newSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-movements'] });
    },
  });
};

export const useCloseCashSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { sessionId: string; closingBalance: number; notes?: string }) => {
      try {
        await api.post<CashSession>(`/cash-sessions/${payload.sessionId}/close`, payload);
      } catch (err) {
        console.warn('Backend offline, closing cash session locally');
      }

      saveLocalSession(null);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-movements'] });
    },
  });
};

export const useCashMovements = (sessionId: string | null) => {
  return useQuery({
    queryKey: ['cash-movements', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      try {
        const { data } = await api.get<CashMovement[]>(`/cash-sessions/${sessionId}/movements`);
        if (Array.isArray(data) && data.length > 0) {
          saveLocalMovements(data);
          return data;
        }
      } catch (err) {
        // Backend offline
      }
      return getLocalMovements();
    },
    enabled: !!sessionId,
  });
};

export const useCreateCashMovement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { sessionId: string; type: 'IN' | 'OUT'; amount: number; description: string; methodId?: string }) => {
      let created: any = null;
      try {
        const { data } = await api.post<CashMovement>(`/cash-sessions/${payload.sessionId}/movements`, payload);
        created = data;
      } catch (err) {
        console.warn('Backend offline, creating cash movement locally');
      }

      const movement = created || {
        id: 'mov-' + Date.now(),
        sessionId: payload.sessionId,
        type: payload.type,
        amount: Number(payload.amount),
        description: payload.description,
        createdAt: new Date().toISOString(),
      };

      const currentMovements = getLocalMovements();
      saveLocalMovements([movement, ...currentMovements]);
      return movement;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cash-movements', variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['cash-sessions'] });
    },
  });
};

export const useCashRegisters = () => {
  return useQuery({
    queryKey: ['cash-registers'],
    queryFn: async () => {
      try {
        const { data } = await api.get<CashRegister[]>('/cash-registers');
        if (Array.isArray(data) && data.length > 0) return data;
      } catch {}
      return DEFAULT_REGISTERS as CashRegister[];
    },
  });
};
