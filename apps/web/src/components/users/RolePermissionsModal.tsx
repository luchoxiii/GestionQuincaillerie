import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Role, 
  PERMISSION_CATALOG, 
  useRoles, 
  useUpdateRolePermissions, 
  useResetRolePermissions 
} from '@/services/users.service';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  ShieldAlert,
  Save,
  RotateCcw,
  X,
  Lock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface RolePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RolePermissionsModal({ isOpen, onClose }: RolePermissionsModalProps) {
  const isAdmin = useAuthStore((state) => state.isAdmin());
  const { data: roles = [] } = useRoles();
  const updateRoleMutation = useUpdateRolePermissions();
  const resetRolesMutation = useResetRolePermissions();

  const [activeRoleTab, setActiveRoleTab] = useState<string>('r-encargado');
  const [rolePermissionsMap, setRolePermissionsMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (roles.length > 0) {
      const map: Record<string, string[]> = {};
      roles.forEach((r) => {
        map[r.id] = [...r.permissions];
      });
      setRolePermissionsMap(map);
      if (!activeRoleTab && roles[0]) {
        setActiveRoleTab(roles[0].id);
      }
    }
  }, [roles, isOpen]);

  if (!isOpen) return null;

  // STRICT ACCESS CHECK: Only admin can manage role permissions
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <Card className="max-w-md w-full p-6 text-center space-y-4 border-destructive/40 shadow-2xl">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Acceso Restringido</h3>
          <p className="text-sm text-muted-foreground">
            Solo los usuarios con rol <strong>Administrador</strong> tienen autorización para consultar y reconfigurar la matriz de permisos.
          </p>
          <Button onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </Card>
      </div>
    );
  }

  const activeRole = roles.find((r) => r.id === activeRoleTab);
  const currentPermissions = rolePermissionsMap[activeRoleTab] || [];
  const isAdminRole = activeRoleTab === 'r-admin' || activeRole?.name.toLowerCase() === 'administrador';

  // Group permissions by module
  const modules = Array.from(new Set(PERMISSION_CATALOG.map((p) => p.module)));

  const handleTogglePermission = (permId: string) => {
    if (isAdminRole) return; // Admin always has everything

    setRolePermissionsMap((prev) => {
      const perms = prev[activeRoleTab] || [];
      const hasPerm = perms.includes(permId);
      const updated = hasPerm ? perms.filter((p) => p !== permId) : [...perms, permId];
      return {
        ...prev,
        [activeRoleTab]: updated,
      };
    });
  };

  const handleSaveRolePermissions = async () => {
    if (isAdminRole) {
      toast.success('El rol Administrador conserva permanentemente acceso total (*)');
      return;
    }

    try {
      await updateRoleMutation.mutateAsync({
        roleId: activeRoleTab,
        permissions: currentPermissions,
      });
      toast.success(`Permisos del rol "${activeRole?.name}" actualizados correctamente`);
    } catch {
      toast.error('Error al guardar los permisos del rol');
    }
  };

  const handleResetDefaults = async () => {
    if (confirm('¿Restablecer todos los roles y permisos a la configuración de fábrica predeterminada?')) {
      try {
        await resetRolesMutation.mutateAsync();
        toast.success('Matriz de permisos restablecida a valores por defecto');
      } catch {
        toast.error('Error al restablecer permisos');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-xl bg-card shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                Gestor de Roles y Permisos Granulares (RBAC)
              </h3>
              <p className="text-xs text-muted-foreground">
                Defina qué acciones operativas tiene permitido ejecutar cada categoría de empleado en el ERP.
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <Tabs value={activeRoleTab} onValueChange={setActiveRoleTab} className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto p-1 gap-1">
              {roles.map((role) => (
                <TabsTrigger
                  key={role.id}
                  value={role.id}
                  className="text-xs py-2 px-3 font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {role.name.toLowerCase().includes('admin') ? (
                      <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
                    ) : (
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    )}
                    <span>{role.name}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {roles.map((role) => (
              <TabsContent key={role.id} value={role.id} className="mt-4 space-y-4">
                {/* Role Description Banner */}
                <div className="rounded-lg border p-3.5 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                      Rol: {role.name}
                      {role.name.toLowerCase().includes('admin') && (
                        <Badge variant="destructive" className="text-[10px]">Superusuario</Badge>
                      )}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {role.description || 'Configuración de permisos de acceso al sistema.'}
                    </p>
                  </div>
                  {!role.name.toLowerCase().includes('admin') && (
                    <div className="text-xs font-medium text-muted-foreground">
                      <span className="text-primary font-bold">
                        {(rolePermissionsMap[role.id] || []).length}
                      </span> de {PERMISSION_CATALOG.length} permisos habilitados
                    </div>
                  )}
                </div>

                {role.name.toLowerCase().includes('admin') ? (
                  <Card className="p-6 text-center space-y-3 border-primary/20 bg-primary/5">
                    <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
                    <h4 className="font-bold text-base text-foreground">Acceso Total e Irrestricto (*)</h4>
                    <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
                      El rol <strong>Administrador</strong> cuenta con privilegios universales de superusuario. Incluye la consulta de bitácoras de auditoría, gestión de cuentas de usuario, reseteo de claves y anulación de cualquier comprobante.
                    </p>
                    <Badge variant="outline" className="border-primary/40 text-primary font-mono text-xs">
                      Permiso universal: * (ALL_PRIVILEGES)
                    </Badge>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {modules.map((moduleName) => {
                      const modulePerms = PERMISSION_CATALOG.filter((p) => p.module === moduleName);
                      return (
                        <Card key={moduleName} className="p-4 space-y-3">
                          <h5 className="font-bold text-xs uppercase tracking-wider text-muted-foreground border-b pb-1.5 flex items-center justify-between">
                            <span>{moduleName}</span>
                            <span className="text-[10px] font-normal normal-case">
                              {modulePerms.filter((p) => currentPermissions.includes(p.id)).length} de {modulePerms.length} activos
                            </span>
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {modulePerms.map((perm) => {
                              const isChecked = currentPermissions.includes(perm.id);
                              const isRestrictedAdminOnly = perm.adminOnly;

                              return (
                                <label
                                  key={perm.id}
                                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs transition-colors ${
                                    isRestrictedAdminOnly
                                      ? 'opacity-60 bg-muted/40 cursor-not-allowed border-dashed'
                                      : isChecked
                                      ? 'border-primary/50 bg-primary/5 cursor-pointer'
                                      : 'border-border bg-background hover:bg-muted/40 cursor-pointer'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    disabled={isRestrictedAdminOnly}
                                    onChange={() => handleTogglePermission(perm.id)}
                                    className="mt-0.5 rounded border-border text-primary focus:ring-primary h-4 w-4"
                                  />
                                  <div className="space-y-0.5 flex-1">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className={`font-semibold ${isChecked ? 'text-primary' : 'text-foreground'}`}>
                                        {perm.action}
                                      </span>
                                      {perm.isCritical && (
                                        <Badge variant="outline" className="text-[9px] px-1 py-0 border-amber-500/40 text-amber-600 dark:text-amber-400">
                                          Crítico
                                        </Badge>
                                      )}
                                      {perm.adminOnly && (
                                        <Badge variant="destructive" className="text-[9px] px-1 py-0">
                                          Solo Admin
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-snug">
                                      {perm.description}
                                    </p>
                                    <div className="text-[10px] font-mono text-muted-foreground/70">
                                      <code>{perm.id}</code>
                                    </div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t px-6 py-3 bg-muted/20 gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetDefaults}
            disabled={resetRolesMutation.isPending}
            className="text-xs text-muted-foreground hover:text-destructive gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restablecer Valores de Fábrica
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cerrar
            </Button>
            {!isAdminRole && (
              <Button
                size="sm"
                onClick={handleSaveRolePermissions}
                disabled={updateRoleMutation.isPending}
                className="gap-1.5 min-w-[140px]"
              >
                {updateRoleMutation.isPending ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Guardar Permisos</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
