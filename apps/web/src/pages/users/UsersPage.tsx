import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  useUsers, 
  useRoles, 
  useDeleteUser, 
  User 
} from '@/services/users.service';
import { matchUserNatural } from '@ferreteria/shared';
import { UserModal } from './UserModal';
import { UserBitacoraModal } from '@/components/users/UserBitacoraModal';
import { RolePermissionsModal } from '@/components/users/RolePermissionsModal';
import { useAuthStore } from '@/stores/auth.store';
import { 
  UserPlus, 
  Search, 
  Edit2, 
  Trash2, 
  Users as UsersIcon, 
  ShieldCheck, 
  UserX, 
  CheckCircle,
  Clock,
  ScrollText,
  KeyRound,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const isAdmin = useAuthStore((state) => state.isAdmin());
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [isBitacoraOpen, setIsBitacoraOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userForBitacora, setUserForBitacora] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { data: users = [], isLoading } = useUsers();
  const { data: roles = [] } = useRoles();
  const deleteUserMutation = useDeleteUser();

  const filteredUsers = useMemo(() => {
    return users.filter((u) => matchUserNatural(u, searchTerm));
  }, [users, searchTerm]);

  const handleOpenCreate = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleOpenBitacora = (user: User) => {
    if (!isAdmin) {
      toast.error('Solo los administradores pueden consultar la bitácora de actividad');
      return;
    }
    setUserForBitacora(user);
    setIsBitacoraOpen(true);
  };

  const handleDelete = async (user: User) => {
    try {
      await deleteUserMutation.mutateAsync(user.id);
      toast.success(`Usuario "${user.username}" desactivado correctamente`);
      setUserToDelete(null);
    } catch {
      toast.error('Error al desactivar el usuario');
    }
  };

  const getRoleBadgeVariant = (roleName: string) => {
    const lower = roleName.toLowerCase();
    if (lower.includes('admin')) {
      return 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/50 dark:text-red-400';
    }
    if (lower.includes('encargado')) {
      return 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-900/50 dark:text-purple-400';
    }
    if (lower.includes('vendedor')) {
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/50 dark:text-emerald-400';
    }
    return 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/50 dark:text-blue-400';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Usuarios y Seguridad
          </h2>
          <p className="text-muted-foreground">
            Gestione operadores, vendedores, administradores, permisos granulares y bitácoras de auditoría.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <Button
              variant="outline"
              onClick={() => setIsRolesModalOpen(true)}
              className="gap-2 border-primary/30 hover:bg-primary/5"
            >
              <KeyRound className="h-4 w-4 text-primary" />
              Roles & Permisos
            </Button>
          )}
          <Button onClick={handleOpenCreate} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Metrics summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <UsersIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="text-xs text-muted-foreground">Usuarios Registrados</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.isActive !== false).length}
            </div>
            <div className="text-xs text-muted-foreground">Cuentas Activas</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">{roles.length}</div>
            <div className="text-xs text-muted-foreground">Roles Operativos</div>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar en lenguaje natural (ej. 'cajeros activos', 'Juan Perez', 'admin')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Cargando usuarios...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
            <UserX className="h-12 w-12 text-muted-foreground/50" />
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">No se encontraron usuarios</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {searchTerm
                  ? 'No hay usuarios que coincidan con la búsqueda.'
                  : 'Aún no se han configurado usuarios adicionales en el sistema.'}
              </p>
            </div>
            {!searchTerm && (
              <Button onClick={handleOpenCreate} className="mt-2">
                <UserPlus className="mr-2 h-4 w-4" />
                Crear Primer Usuario
              </Button>
            )}
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b bg-muted/40">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-11 px-4 text-left align-middle font-semibold text-muted-foreground">Usuario</th>
                  <th className="h-11 px-4 text-left align-middle font-semibold text-muted-foreground">Nombre Completo</th>
                  <th className="h-11 px-4 text-left align-middle font-semibold text-muted-foreground">Correo Electrónico</th>
                  <th className="h-11 px-4 text-left align-middle font-semibold text-muted-foreground">Roles & Permisos</th>
                  <th className="h-11 px-4 text-center align-middle font-semibold text-muted-foreground">Estado</th>
                  <th className="h-11 px-4 text-right align-middle font-semibold text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0 divide-y">
                {filteredUsers.map((user) => {
                  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || user.username.substring(0, 2).toUpperCase();
                  const assignedRoles = user.userRoles?.map((ur) => ur.role?.name || ur.roleId) || [];
                  const extraPermsCount = user.customPermissions?.length || 0;

                  return (
                    <tr key={user.id} className="transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground font-mono">{user.username}</div>
                            {user.lastLoginAt && (
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(user.lastLoginAt).toLocaleDateString('es-AR')}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle font-medium text-foreground">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {assignedRoles.length > 0 ? (
                            assignedRoles.map((roleName, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className={`text-xs font-medium ${getRoleBadgeVariant(roleName)}`}
                              >
                                {roleName}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">Sin rol asignado</span>
                          )}
                          {extraPermsCount > 0 && (
                            <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                              +{extraPermsCount} extras
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-middle text-center">
                        <Badge variant={user.isActive !== false ? 'default' : 'secondary'}>
                          {user.isActive !== false ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* BITÁCORA: Only visible and accessible by Admin */}
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenBitacora(user)}
                              title="Ver Bitácora de Actividad del Usuario"
                              className="text-primary hover:bg-primary/10 gap-1 text-xs"
                            >
                              <ScrollText className="h-4 w-4" />
                              <span className="hidden sm:inline">Bitácora</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(user)}
                            title="Editar usuario"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => setUserToDelete(user)}
                            title="Desactivar usuario"
                            disabled={user.username === 'admin'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* User Create / Edit Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userToEdit={userToEdit}
        roles={roles}
        onOpenBitacora={(u) => handleOpenBitacora(u)}
      />

      {/* Role & Granular Permissions Modal (Admin Only) */}
      <RolePermissionsModal
        isOpen={isRolesModalOpen}
        onClose={() => setIsRolesModalOpen(false)}
      />

      {/* Individual User Bitacora Modal (Admin Only) */}
      <UserBitacoraModal
        isOpen={isBitacoraOpen}
        onClose={() => {
          setIsBitacoraOpen(false);
          setUserForBitacora(null);
        }}
        user={userForBitacora}
      />

      {/* Deactivate Confirmation Dialog */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg border space-y-4">
            <h3 className="text-lg font-bold text-foreground">¿Desactivar usuario?</h3>
            <p className="text-sm text-muted-foreground">
              ¿Está seguro que desea desactivar al usuario{' '}
              <strong className="text-foreground">"{userToDelete.username}"</strong> ({userToDelete.firstName} {userToDelete.lastName})? No podrá iniciar sesión hasta que vuelva a ser activado.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setUserToDelete(null)}
                disabled={deleteUserMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(userToDelete)}
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending ? 'Desactivando...' : 'Sí, desactivar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
