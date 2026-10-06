import { create } from 'zustand';

export interface AuthUser {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: string;
  permissions?: string[];
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  checkAuth: () => void;
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
}

const getStoredUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem('user');
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getStoredUser(),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false });
  },
  checkAuth: () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false, user: null, token: null });
    } else {
      const user = getStoredUser();
      set({ isAuthenticated: true, token, user: user || get().user });
    }
  },
  isAdmin: () => {
    const user = get().user;
    if (!user) return false;
    const role = (user.role || '').toUpperCase();
    return role === 'ADMIN' || role === 'ADMINISTRADOR';
  },
  hasPermission: (permission: string) => {
    const user = get().user;
    if (!user) return false;
    const role = (user.role || '').toUpperCase();
    
    // Admin has universal superuser access
    if (role === 'ADMIN' || role === 'ADMINISTRADOR') return true;
    
    const permissions = user.permissions || [];
    if (permissions.includes('*')) return true;
    if (permissions.includes(permission)) return true;

    // Check module wildcard e.g. "pos:*" matches "pos:discount"
    const [module] = permission.split(':');
    if (module && permissions.includes(`${module}:*`)) return true;

    return false;
  },
}));

