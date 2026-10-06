import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { matchUserNatural } from '@ferreteria/shared';
import { recordAuditLog } from './audit.service';
import { useAuthStore } from '@/stores/auth.store';

export interface PermissionItem {
  id: string;
  module: string;
  action: string;
  description: string;
  isCritical?: boolean;
  adminOnly?: boolean;
}

export const PERMISSION_CATALOG: PermissionItem[] = [
  // Punto de Venta
  { id: 'pos:access', module: 'Punto de Venta', action: 'Acceso a Terminal POS', description: 'Permite abrir y operar la pantalla de venta mostrador' },
  { id: 'pos:discount', module: 'Punto de Venta', action: 'Aplicar Descuentos y Cupones', description: 'Habilidad para aplicar cupones promocionales y bonificaciones en caja', isCritical: true },
  { id: 'pos:price_check', module: 'Punto de Venta', action: 'Consulta Rápida de Precios', description: 'Visualizar precios de lista, ofertas y stock disponible' },
  { id: 'pos:custom_client', module: 'Punto de Venta', action: 'Asignar o Cambiar Cliente', description: 'Vincular ventas a cuentas corrientes o clientes específicos' },

  // Ventas & Facturación
  { id: 'sales:read', module: 'Ventas', action: 'Consultar Historial de Ventas', description: 'Ver comprobantes emitidos, medios de pago y clientes' },
  { id: 'sales:create', module: 'Ventas', action: 'Emitir Tickets y Comprobantes', description: 'Generar comprobantes fiscales y no fiscales' },
  { id: 'sales:void', module: 'Ventas', action: 'Anular Ventas Realizadas', description: 'Emitir Notas de Crédito o anular comprobantes de caja', isCritical: true },
  { id: 'invoicing:emit_fiscal', module: 'Ventas', action: 'Facturación AFIP (A/B)', description: 'Generar CAE de facturas electrónicas oficiales' },
  { id: 'invoicing:export', module: 'Ventas', action: 'Exportación de Ventas e IVA', description: 'Exportar reportes de ventas y libros de IVA a Excel/CSV' },

  // Inventario & Precios
  { id: 'products:read', module: 'Inventario', action: 'Consultar Catálogo y Stock', description: 'Ver artículos, códigos de barra y niveles de existencia' },
  { id: 'products:create', module: 'Inventario', action: 'Crear y Editar Artículos', description: 'Alta y modificación de fichas de productos' },
  { id: 'products:edit_price', module: 'Inventario', action: 'Modificar Precios y Costos', description: 'Cambiar costos de reposición y precios de venta al público', isCritical: true },
  { id: 'products:mass_price', module: 'Inventario', action: 'Actualización Masiva de Precios', description: 'Aumentos porcentuales masivos por rubro o proveedor', isCritical: true },
  { id: 'stock:adjust', module: 'Inventario', action: 'Ajuste Manual de Inventario', description: 'Corrección de sobrantes/faltantes de stock físico', isCritical: true },
  { id: 'stock:transfer', module: 'Inventario', action: 'Transferencias entre Sucursales', description: 'Mover mercadería entre depósitos y locales' },

  // Clientes & Cuentas Corrientes
  { id: 'customers:read', module: 'Clientes', action: 'Consultar Base de Clientes', description: 'Ver fichas de clientes, historial y saldos' },
  { id: 'customers:write', module: 'Clientes', action: 'Crear y Modificar Clientes', description: 'Editar datos fiscales, contactos y domicilios' },
  { id: 'customers:credit_limit', module: 'Clientes', action: 'Modificar Límite de Crédito', description: 'Aumentar o definir margen de cuenta corriente', isCritical: true },
  { id: 'customers:ban', module: 'Clientes', action: 'Inhabilitar / Vetar Clientes', description: 'Bloquear cuentas con cheques rechazados o mora grave', isCritical: true },

  // Compras & Proveedores
  { id: 'purchases:read', module: 'Compras', action: 'Ver Órdenes de Compra', description: 'Consultar compras efectuadas y remitos pendientes' },
  { id: 'purchases:create', module: 'Compras', action: 'Generar Órdenes y Recepción', description: 'Cargar facturas de compra y recepcionar bultos' },
  { id: 'suppliers:manage', module: 'Compras', action: 'Administrar Proveedores', description: 'Alta y edición de fichas de proveedores' },

  // Caja & Tesorería
  { id: 'cash:open', module: 'Caja', action: 'Apertura de Turno de Caja', description: 'Iniciar jornada con saldo inicial de efectivo' },
  { id: 'cash:close', module: 'Caja', action: 'Arqueo y Cierre Z de Caja', description: 'Cierre ciego o arqueo general de caja', isCritical: true },
  { id: 'cash:movements', module: 'Caja', action: 'Ingresos y Retiros de Fondos', description: 'Registrar gastos menores y extracciones de efectivo', isCritical: true },

  // E-Commerce
  { id: 'ecommerce:read', module: 'E-Commerce', action: 'Consultar Pedidos Online', description: 'Ver ventas de Mercado Libre y Tienda Online' },
  { id: 'ecommerce:dispatch', module: 'E-Commerce', action: 'Empaquetado y Despacho', description: 'Asignar número de seguimiento y marcar despachado' },
  { id: 'ecommerce:sync', module: 'E-Commerce', action: 'Sincronizar Publicaciones', description: 'Pausar o republicar ítems en marketplace' },

  // Seguridad & Bitácora (Audit es estrictamente solo Admin)
  { id: 'users:read', module: 'Seguridad', action: 'Ver Directorio de Usuarios', description: 'Listar empleados y operadores del sistema' },
  { id: 'users:manage', module: 'Seguridad', action: 'Crear y Modificar Cuentas', description: 'Gestión de credenciales y reseteo de claves', isCritical: true },
  { id: 'roles:manage', module: 'Seguridad', action: 'Gestionar Matriz de Permisos', description: 'Configurar permisos asignados a cada rol', isCritical: true },
  { id: 'audit:read', module: 'Seguridad', action: 'Consultar Bitácoras de Auditoría', description: 'Acceso a la bitácora individual y auditoría completa del sistema', isCritical: true, adminOnly: true },
];

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem?: boolean;
}

export interface UserRole {
  roleId: string;
  role: Role;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
  userRoles?: UserRole[];
  customPermissions?: string[];
  deniedPermissions?: string[];
}

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isActive?: boolean;
  roleIds?: string[];
  customPermissions?: string[];
}

export interface UpdateUserInput {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
  roleIds?: string[];
  customPermissions?: string[];
  deniedPermissions?: string[];
}

const STORAGE_KEY_USERS = 'ferreteria_local_users';
const STORAGE_KEY_ROLES = 'ferreteria_local_roles';

export const DEFAULT_ROLES: Role[] = [
  {
    id: 'r-admin',
    name: 'Administrador',
    description: 'Acceso irrestricto total al sistema, configuraciones y bitácoras de auditoría.',
    permissions: ['*'],
    isSystem: true,
  },
  {
    id: 'r-encargado',
    name: 'Encargado',
    description: 'Operación completa de salón, ventas, compras, catálogo y arqueos. Sin acceso a bitácora ni gestión de administradores.',
    permissions: [
      'pos:access', 'pos:discount', 'pos:price_check', 'pos:custom_client',
      'sales:read', 'sales:create', 'sales:void', 'invoicing:emit_fiscal', 'invoicing:export',
      'products:read', 'products:create', 'products:edit_price', 'products:mass_price', 'stock:adjust', 'stock:transfer',
      'customers:read', 'customers:write', 'customers:credit_limit',
      'purchases:read', 'purchases:create', 'suppliers:manage',
      'cash:open', 'cash:close', 'cash:movements',
      'ecommerce:read', 'ecommerce:dispatch', 'ecommerce:sync',
      'users:read'
    ],
    isSystem: true,
  },
  {
    id: 'r-vendedor',
    name: 'Vendedor (Cajero)',
    description: 'Atención en mostrador, emisión de comprobantes, consulta de stock y cobro. Sin permisos de anulación ni modificación de precios.',
    permissions: [
      'pos:access', 'pos:price_check', 'pos:custom_client',
      'sales:read', 'sales:create',
      'customers:read',
      'cash:open', 'cash:movements'
    ],
    isSystem: true,
  },
  {
    id: 'r-deposito',
    name: 'Depósito / Almacén',
    description: 'Recepción de mercadería de proveedores, control de stock y transferencias entre depósitos.',
    permissions: [
      'products:read',
      'stock:adjust', 'stock:transfer',
      'purchases:read', 'purchases:create'
    ],
    isSystem: true,
  },
];

export const getLocalRoles = (): Role[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ROLES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((r: any) => {
          const fallback = DEFAULT_ROLES.find((d) => d.id === r.id);
          return {
            id: r.id,
            name: r.name || fallback?.name || r.id,
            description: r.description || fallback?.description,
            permissions: Array.isArray(r.permissions) ? r.permissions : (fallback?.permissions || []),
            isSystem: r.isSystem ?? fallback?.isSystem ?? false,
          };
        });
      }
    }
  } catch {}
  return DEFAULT_ROLES;
};

export const saveLocalRoles = (roles: Role[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_ROLES, JSON.stringify(roles));
  } catch (e) {
    console.error('Error saving local roles:', e);
  }
};

const INITIAL_USERS: User[] = [
  {
    id: 'u-admin',
    username: 'admin',
    email: 'admin@ferreteria.local',
    firstName: 'Administrador',
    lastName: 'Principal',
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    userRoles: [{ roleId: 'r-admin', role: DEFAULT_ROLES[0] }],
    customPermissions: ['*'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-cajero',
    username: 'cajero',
    email: 'cajero@ferreteria.local',
    firstName: 'Juan',
    lastName: 'Pérez',
    isActive: true,
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    userRoles: [{ roleId: 'r-vendedor', role: DEFAULT_ROLES[2] }],
    customPermissions: ['pos:discount'], // Permiso especial otorgado
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    id: 'u-deposito',
    username: 'deposito',
    email: 'deposito@ferreteria.local',
    firstName: 'Carlos',
    lastName: 'López',
    isActive: true,
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    userRoles: [{ roleId: 'r-deposito', role: DEFAULT_ROLES[3] }],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
  },
  {
    id: 'u-encargado',
    username: 'encargado',
    email: 'encargado@ferreteria.local',
    firstName: 'Martín',
    lastName: 'Gómez',
    isActive: true,
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    userRoles: [{ roleId: 'r-encargado', role: DEFAULT_ROLES[1] }],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
  },
];

const getLocalUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading localStorage for users:', e);
  }
  return INITIAL_USERS;
};

const saveLocalUsers = (users: User[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving localStorage for users:', e);
  }
};

export const USER_KEYS = {
  all: ['users'] as const,
  lists: () => [...USER_KEYS.all, 'list'] as const,
  list: (filters: any) => [...USER_KEYS.lists(), filters] as const,
  details: () => [...USER_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...USER_KEYS.details(), id] as const,
  roles: () => ['roles'] as const,
};

export const useUsers = (filters?: { search?: string; page?: number; limit?: number }) => {
  return useQuery<User[]>({
    queryKey: USER_KEYS.list(filters),
    queryFn: async (): Promise<User[]> => {
      try {
        const { data } = await api.get('/users', { params: filters });
        const list = Array.isArray(data) ? data : (data.data || []);
        if (list.length > 0) {
          saveLocalUsers(list);
          return list as User[];
        }
      } catch (err) {
        // Backend offline, fallback to browser storage
      }

      let local = getLocalUsers();
      if (filters?.search) {
        local = local.filter((u) => matchUserNatural(u, filters.search!));
      }
      return local;
    },
  });
};

export const useUser = (id: string) => {
  return useQuery<User>({
    queryKey: USER_KEYS.detail(id),
    queryFn: async (): Promise<User> => {
      try {
        const { data } = await api.get(`/users/${id}`);
        return data as User;
      } catch (err) {
        const list = getLocalUsers();
        const found = list.find((u) => u.id === id);
        if (found) return found;
        throw new Error('Usuario no encontrado');
      }
    },
    enabled: !!id,
  });
};

export const getUserEffectivePermissions = (user: User, rolesList?: Role[]): string[] => {
  const currentRoles = rolesList || getLocalRoles();
  const permissionsSet = new Set<string>();

  // 1. Roles permissions
  (user.userRoles || []).forEach((ur) => {
    const roleId = ur.roleId || ur.role?.id;
    const foundRole = currentRoles.find((r) => r.id === roleId);
    if (foundRole && Array.isArray(foundRole.permissions)) {
      foundRole.permissions.forEach((p) => permissionsSet.add(p));
    } else if (ur.role && Array.isArray(ur.role.permissions)) {
      ur.role.permissions.forEach((p) => permissionsSet.add(p));
    }
  });

  // 2. Custom granted permissions
  if (Array.isArray(user.customPermissions)) {
    user.customPermissions.forEach((p) => permissionsSet.add(p));
  }

  // 3. Denied / revoked permissions
  if (Array.isArray(user.deniedPermissions)) {
    user.deniedPermissions.forEach((p) => permissionsSet.delete(p));
  }

  return Array.from(permissionsSet);
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateUserInput): Promise<User> => {
      let created: any = null;
      try {
        const { data } = await api.post('/users', payload);
        created = data;
      } catch (err) {
        console.warn('Backend offline, saving user to browser storage');
      }

      const currentRoles = getLocalRoles();
      const roleMap: Record<string, Role> = {};
      currentRoles.forEach((r) => { roleMap[r.id] = r; });

      const newUser: User = {
        id: created?.id || 'usr-' + Date.now(),
        username: payload.username,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        isActive: payload.isActive !== false,
        userRoles: (payload.roleIds || ['r-vendedor']).map((rId) => ({
          roleId: rId,
          role: roleMap[rId] || { id: rId, name: rId, permissions: [] },
        })),
        customPermissions: payload.customPermissions || [],
        createdAt: new Date().toISOString(),
      };

      const list = getLocalUsers();
      saveLocalUsers([newUser, ...list.filter((u) => u.id !== newUser.id)]);

      // Audit Log entry
      const actor = useAuthStore.getState().user?.name || 'Administrador Principal';
      const actorId = useAuthStore.getState().user?.id || 'u-admin';
      recordAuditLog({
        userId: actorId,
        user: actor,
        role: 'ADMIN',
        action: 'CREATE',
        entity: 'User',
        entityId: newUser.id,
        description: `Alta de nuevo usuario: ${newUser.firstName} ${newUser.lastName} (${newUser.username})`,
        details: {
          username: newUser.username,
          email: newUser.email,
          roles: payload.roleIds || ['r-vendedor'],
          isActive: newUser.isActive,
        },
      });

      return created || newUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, roleIds, ...payload }: UpdateUserInput) => {
      try {
        await api.put(`/users/${id}`, payload);
        if (roleIds !== undefined) {
          await api.put(`/users/${id}/roles`, { roleIds });
        }
      } catch (err) {
        console.warn('Backend offline, updating user in browser storage');
      }

      const currentRoles = getLocalRoles();
      const roleMap: Record<string, Role> = {};
      currentRoles.forEach((r) => { roleMap[r.id] = r; });

      const list = getLocalUsers();
      const index = list.findIndex((u) => u.id === id);
      if (index !== -1) {
        const current = list[index];
        const updatedUser: User = {
          ...current,
          ...payload,
          firstName: payload.firstName !== undefined ? payload.firstName : current.firstName,
          lastName: payload.lastName !== undefined ? payload.lastName : current.lastName,
          email: payload.email !== undefined ? payload.email : current.email,
          isActive: payload.isActive !== undefined ? payload.isActive : current.isActive,
          customPermissions: payload.customPermissions !== undefined ? payload.customPermissions : current.customPermissions,
          deniedPermissions: payload.deniedPermissions !== undefined ? payload.deniedPermissions : current.deniedPermissions,
          userRoles: roleIds !== undefined
            ? roleIds.map((rId) => ({ roleId: rId, role: roleMap[rId] || { id: rId, name: rId, permissions: [] } }))
            : current.userRoles,
        };
        list[index] = updatedUser;
        saveLocalUsers([...list]);

        // Audit Log entry
        const actor = useAuthStore.getState().user?.name || 'Administrador Principal';
        const actorId = useAuthStore.getState().user?.id || 'u-admin';
        recordAuditLog({
          userId: actorId,
          user: actor,
          role: 'ADMIN',
          action: 'UPDATE',
          entity: 'User',
          entityId: id,
          description: `Modificación de ficha y roles del usuario: ${updatedUser.firstName} ${updatedUser.lastName} (${updatedUser.username})`,
          details: { id, changes: payload, roleIds },
        });
      }
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.detail(variables.id) });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.delete(`/users/${id}`);
      } catch (err) {
        console.warn('Backend offline, deactivating user in browser storage');
      }

      const list = getLocalUsers();
      const index = list.findIndex((u) => u.id === id);
      if (index !== -1) {
        list[index].isActive = false;
        saveLocalUsers([...list]);

        // Audit Log entry
        const actor = useAuthStore.getState().user?.name || 'Administrador Principal';
        const actorId = useAuthStore.getState().user?.id || 'u-admin';
        recordAuditLog({
          userId: actorId,
          user: actor,
          role: 'ADMIN',
          action: 'DELETE',
          entity: 'User',
          entityId: id,
          description: `Desactivación / Baja de cuenta de usuario (${list[index].username})`,
          details: { id, username: list[index].username, isActive: false },
        });
      }
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
};

export const useRoles = () => {
  return useQuery<Role[]>({
    queryKey: USER_KEYS.roles(),
    queryFn: async (): Promise<Role[]> => {
      try {
        const { data } = await api.get('/roles');
        if (Array.isArray(data) && data.length > 0) {
          saveLocalRoles(data);
          return data;
        }
      } catch {}
      return getLocalRoles();
    },
  });
};

export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ roleId, permissions }: { roleId: string; permissions: string[] }) => {
      const roles = getLocalRoles();
      const idx = roles.findIndex((r) => r.id === roleId);
      if (idx !== -1) {
        roles[idx] = { ...roles[idx], permissions };
        saveLocalRoles([...roles]);
      }
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.roles() });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
};

export const useResetRolePermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      saveLocalRoles(DEFAULT_ROLES);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.roles() });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
};

