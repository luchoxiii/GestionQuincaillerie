import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Role, 
  PERMISSION_CATALOG, 
  getUserEffectivePermissions, 
  useCreateUser, 
  useUpdateUser 
} from '@/services/users.service';
import { useAuthStore } from '@/stores/auth.store';
import { 
  Shield, 
  UserPlus, 
  Save, 
  X, 
  Lock, 
  ScrollText, 
  ChevronDown, 
  ChevronUp, 
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit: User | null;
  roles: Role[];
  onOpenBitacora?: (user: User) => void;
}

export function UserModal({ isOpen, onClose, userToEdit, roles, onOpenBitacora }: UserModalProps) {
  const isEditing = Boolean(userToEdit);
  const isAdmin = useAuthStore((state) => state.isAdmin());
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [customPermissions, setCustomPermissions] = useState<string[]>([]);
  const [deniedPermissions, setDeniedPermissions] = useState<string[]>([]);
  const [showAdvancedPerms, setShowAdvancedPerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        setUsername(userToEdit.username);
        setEmail(userToEdit.email);
        setPassword(''); // Password blank on edit unless changed
        setFirstName(userToEdit.firstName);
        setLastName(userToEdit.lastName);
        setIsActive(userToEdit.isActive);
        const roleIds = userToEdit.userRoles?.map((ur) => ur.roleId || ur.role?.id).filter(Boolean) || [];
        setSelectedRoleIds(roleIds as string[]);
        setCustomPermissions(userToEdit.customPermissions || []);
        setDeniedPermissions(userToEdit.deniedPermissions || []);
      } else {
        setUsername('');
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
        setIsActive(true);
        const defaultRole = roles.find((r) => r.name.toLowerCase() === 'vendedor') || roles[0];
        setSelectedRoleIds(defaultRole ? [defaultRole.id] : ['r-vendedor']);
        setCustomPermissions([]);
        setDeniedPermissions([]);
      }
      setShowAdvancedPerms(false);
      setErrors({});
    }
  }, [isOpen, userToEdit, roles]);

  if (!isOpen) return null;

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const toggleCustomPermission = (permId: string) => {
    setCustomPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
    // If it was denied, remove from denied
    setDeniedPermissions((prev) => prev.filter((p) => p !== permId));
  };

  // Calculate total active permissions preview
  const simulatedUser: User = {
    id: userToEdit?.id || 'preview',
    username,
    email,
    firstName,
    lastName,
    isActive,
    userRoles: selectedRoleIds.map((rId) => ({
      roleId: rId,
      role: roles.find((r) => r.id === rId) || { id: rId, name: rId, permissions: [] },
    })),
    customPermissions,
    deniedPermissions,
  };

  const effectivePermissions = getUserEffectivePermissions(simulatedUser, roles);
  const isSuperUser = effectivePermissions.includes('*') || selectedRoleIds.includes('r-admin');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!username.trim()) newErrors.username = 'El nombre de usuario es obligatorio';
    if (!email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Ingrese un correo electrónico válido';
    }
    if (!isEditing && !password) {
      newErrors.password = 'La contraseña es requerida para nuevos usuarios';
    } else if (password && password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (!firstName.trim()) newErrors.firstName = 'El nombre es obligatorio';
    if (!lastName.trim()) newErrors.lastName = 'El apellido es obligatorio';
    if (selectedRoleIds.length === 0) newErrors.roles = 'Debe asignar al menos un rol';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Complete todos los campos requeridos correctamente');
      return;
    }

    try {
      if (isEditing && userToEdit) {
        await updateUserMutation.mutateAsync({
          id: userToEdit.id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password: password ? password : undefined,
          isActive,
          roleIds: selectedRoleIds,
          customPermissions,
          deniedPermissions,
        });
        toast.success('Usuario y permisos actualizados correctamente');
      } else {
        await createUserMutation.mutateAsync({
          username: username.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          isActive,
          roleIds: selectedRoleIds,
          customPermissions,
        });
        toast.success('Usuario creado correctamente');
      }
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al procesar el usuario';
      toast.error(typeof msg === 'string' ? msg : 'Error de validación al guardar');
    }
  };

  const isSubmitting = createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-xl bg-card shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {isEditing ? <Shield className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {isEditing ? `Editar Usuario: ${userToEdit?.username}` : 'Nuevo Usuario'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isEditing
                  ? 'Modifique datos personales, roles y permisos específicos del operador.'
                  : 'Configure la cuenta y asigne los permisos operativos correspondientes.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditing && userToEdit && isAdmin && onOpenBitacora && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenBitacora(userToEdit);
                }}
                className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10"
              >
                <ScrollText className="h-3.5 w-3.5" />
                Ver Bitácora
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} disabled={isSubmitting}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Form Body with scrolling */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Identity Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Username */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Nombre de Usuario <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="ej. jperez"
                value={username}
                disabled={isEditing || isSubmitting}
                onChange={(e) => setUsername(e.target.value)}
                className={errors.username ? 'border-destructive' : ''}
              />
              {errors.username && <p className="text-[11px] text-destructive">{errors.username}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Correo Electrónico <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                placeholder="ej. jperez@ferreteria.local"
                value={email}
                disabled={isSubmitting}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-[11px] text-destructive">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* First Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Nombre <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Juan"
                value={firstName}
                disabled={isSubmitting}
                onChange={(e) => setFirstName(e.target.value)}
                className={errors.firstName ? 'border-destructive' : ''}
              />
              {errors.firstName && <p className="text-[11px] text-destructive">{errors.firstName}</p>}
            </div>

            {/* Last Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Apellido <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Pérez"
                value={lastName}
                disabled={isSubmitting}
                onChange={(e) => setLastName(e.target.value)}
                className={errors.lastName ? 'border-destructive' : ''}
              />
              {errors.lastName && <p className="text-[11px] text-destructive">{errors.lastName}</p>}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1">
              <Lock className="h-3 w-3 text-muted-foreground" />
              Contraseña {isEditing ? '(dejar en blanco para conservar actual)' : <span className="text-destructive">*</span>}
            </label>
            <Input
              type="password"
              placeholder={isEditing ? '••••••••' : 'Mínimo 6 caracteres'}
              value={password}
              disabled={isSubmitting}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? 'border-destructive' : ''}
            />
            {errors.password && <p className="text-[11px] text-destructive">{errors.password}</p>}
          </div>

          {/* Roles Selection */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                Roles del Usuario <span className="text-destructive">*</span>
              </label>
              <span className="text-[11px] text-muted-foreground">
                {isSuperUser ? 'Acceso Total (*)' : `${effectivePermissions.length} permisos activos`}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg border p-3 bg-muted/20">
              {roles.map((role) => {
                const isChecked = selectedRoleIds.includes(role.id);
                return (
                  <label
                    key={role.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-md border cursor-pointer transition-colors text-xs ${
                      isChecked
                        ? 'border-primary/50 bg-primary/10 text-primary font-medium'
                        : 'border-border bg-background hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleRole(role.id)}
                      className="mt-0.5 rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-semibold">
                        {role.name}
                        {role.name.toLowerCase().includes('admin') && (
                          <Badge variant="destructive" className="text-[9px] px-1 py-0">Admin</Badge>
                        )}
                      </div>
                      {role.description && (
                        <div className="text-[11px] text-muted-foreground line-clamp-2">
                          {role.description}
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
            {errors.roles && <p className="text-[11px] text-destructive">{errors.roles}</p>}
          </div>

          {/* Granular Permissions Overrides (Collapsible) */}
          <div className="rounded-lg border bg-card overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvancedPerms(!showAdvancedPerms)}
              className="w-full flex items-center justify-between p-3 text-xs font-semibold text-foreground bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" />
                <span>Permisos Granulares Adicionales (Excepciones Directas)</span>
                {customPermissions.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] bg-primary/15 text-primary">
                    +{customPermissions.length} extras
                  </Badge>
                )}
              </div>
              {showAdvancedPerms ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showAdvancedPerms && (
              <div className="p-4 space-y-4 border-t bg-muted/10">
                <p className="text-xs text-muted-foreground">
                  Puede otorgar permisos especiales adicionales a este usuario sin necesidad de crear un rol nuevo.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {PERMISSION_CATALOG.filter((p) => !p.adminOnly).map((perm) => {
                    const isGrantedByRole = effectivePermissions.includes(perm.id) && !customPermissions.includes(perm.id);
                    const isDirectlyGranted = customPermissions.includes(perm.id);

                    return (
                      <label
                        key={perm.id}
                        className={`flex items-start gap-2 p-2 rounded-md border text-xs transition-colors ${
                          isDirectlyGranted
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-950 dark:text-emerald-300 font-medium cursor-pointer'
                            : isGrantedByRole
                            ? 'border-border bg-muted/40 opacity-70 cursor-not-allowed'
                            : 'border-border bg-background hover:bg-muted/40 cursor-pointer'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isDirectlyGranted || isGrantedByRole}
                          disabled={isGrantedByRole}
                          onChange={() => toggleCustomPermission(perm.id)}
                          className="mt-0.5 rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                        />
                        <div className="space-y-0.5 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{perm.action}</span>
                            {isGrantedByRole && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0">Por Rol</Badge>
                            )}
                            {isDirectlyGranted && (
                              <Badge className="bg-emerald-600 text-white text-[9px] px-1 py-0">Directo</Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground">{perm.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Active status */}
          <div className="flex items-center justify-between rounded-lg border p-3 bg-background">
            <div>
              <div className="text-xs font-semibold text-foreground">Cuenta Activa</div>
              <div className="text-[11px] text-muted-foreground">
                {isActive ? 'El usuario puede iniciar sesión y operar en el sistema' : 'Acceso bloqueado en terminales'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[130px] gap-2">
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{isEditing ? 'Guardar Cambios' : 'Crear Usuario'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
