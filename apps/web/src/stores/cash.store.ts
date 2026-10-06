import { create } from 'zustand';

export interface CashSession {
  id: string;
  startTime: Date;
  initialAmount: number;
  status: 'OPEN' | 'CLOSED';
}

export interface CashState {
  currentSession: CashSession | null;
  activeRegister: string | null;
  setSession: (session: CashSession | null) => void;
  setRegister: (register: string | null) => void;
}

export const useCashStore = create<CashState>((set) => ({
  currentSession: null,
  activeRegister: null,
  setSession: (session) => set({ currentSession: session }),
  setRegister: (register) => set({ activeRegister: register }),
}));
