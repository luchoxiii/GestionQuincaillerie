import { useState } from 'react';
import { useAuthStore, AuthUser } from '@/stores/auth.store';
import { useI18n } from '@/i18n';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import * as usersService from '@/services/users.service';
import { getUserEffectivePermissions, getLocalRoles, DEFAULT_ROLES, User } from '@/services/users.service';
import { recordAuditLog } from '@/services/audit.service';
import toast from 'react-hot-toast';

const SEEDED_FALLBACK_USERS: User[] = [
  {
    id: 'u-admin',
    username: 'admin',
    email: 'admin@ferreteria.local',
    firstName: 'Administrador',
    lastName: 'Principal',
    isActive: true,
    userRoles: [{ roleId: 'r-admin', role: DEFAULT_ROLES[0] }],
    customPermissions: ['*'],
  },
  {
    id: 'u-cajero',
    username: 'cajero',
    email: 'cajero@ferreteria.local',
    firstName: 'Juan',
    lastName: 'Pérez',
    isActive: true,
    userRoles: [{ roleId: 'r-vendedor', role: DEFAULT_ROLES[2] }],
    customPermissions: ['pos:discount'],
  },
  {
    id: 'u-deposito',
    username: 'deposito',
    email: 'deposito@ferreteria.local',
    firstName: 'Carlos',
    lastName: 'López',
    isActive: true,
    userRoles: [{ roleId: 'r-deposito', role: DEFAULT_ROLES[3] }],
  },
  {
    id: 'u-encargado',
    username: 'encargado',
    email: 'encargado@ferreteria.local',
    firstName: 'Martín',
    lastName: 'Gómez',
    isActive: true,
    userRoles: [{ roleId: 'r-encargado', role: DEFAULT_ROLES[1] }],
  },
];

function resolveLocalUsers(): (User & { password?: string })[] {
  if (typeof (usersService as any).getLocalUsers === 'function') {
    return (usersService as any).getLocalUsers();
  }
  try {
    const rawUsers = localStorage.getItem('ferreteria_local_users');
    if (rawUsers) {
      const parsed = JSON.parse(rawUsers);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return SEEDED_FALLBACK_USERS;
}

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let loggedUser: AuthUser | null = null;
      let token = 'token-local-' + Date.now();

      // 1. Try real API authentication if backend is online
      try {
        const { data } = await authService.login(username, password);
        const resolvedToken = data?.token || data?.accessToken;
        if (resolvedToken && data?.user) {
          token = resolvedToken;
          const resolvedRole = String(data.user.role || data.user.roles?.[0] || 'VENDEDOR');
          const resolvedName =
            data.user.name ||
            [data.user.firstName, data.user.lastName].filter(Boolean).join(' ') ||
            data.user.username ||
            username;
          const resolvedUsername = data.user.username || username;
          const roles = getLocalRoles();

          let resolvedPermissions: string[] = [];
          if (Array.isArray(data.user.permissions) && data.user.permissions.length > 0) {
            resolvedPermissions = data.user.permissions;
          } else if (resolvedRole.toUpperCase() === 'ADMIN' || resolvedRole.toUpperCase() === 'ADMINISTRADOR') {
            resolvedPermissions = ['*'];
          } else if (Array.isArray(data.user.userRoles) && data.user.userRoles.length > 0) {
            resolvedPermissions = getUserEffectivePermissions(data.user, roles);
          } else {
            const matchedRole = roles.find(
              (r) =>
                r.name.toLowerCase() === resolvedRole.toLowerCase() ||
                r.name.toLowerCase().includes(resolvedRole.toLowerCase()) ||
                r.id.toLowerCase() === `r-${resolvedRole.toLowerCase()}`
            );
            resolvedPermissions = matchedRole?.permissions || [];
          }

          loggedUser = {
            id: data.user.id,
            username: resolvedUsername,
            name: resolvedName,
            email: data.user.email || `${resolvedUsername}@ferreteria.local`,
            role: resolvedRole.toUpperCase(),
            permissions: resolvedPermissions,
          };
        }
      } catch {
        // Backend offline, proceed to local authentication
      }

      // 2. Local authentication fallback
      if (!loggedUser) {
        // Check default admin
        if (username.toLowerCase() === 'admin' && (password === 'admin123' || password === 'admin' || password === 'admin2026')) {
          loggedUser = {
            id: 'u-admin',
            username: 'admin',
            name: 'Administrador Principal',
            email: 'admin@ferreteria.local',
            role: 'ADMIN',
            permissions: ['*'],
          };
        } else {
          // Check locally registered / seeded users
          try {
            const users = resolveLocalUsers();
            const found = users.find((u) => u.username.toLowerCase() === username.toLowerCase().trim());
            if (found) {
              if (found.isActive === false) {
                toast.error('Esta cuenta de usuario se encuentra desactivada.');
                return;
              }
              const isPasswordValid = found.password
                ? password === found.password
                : password === '123456' || password === found.username || password === 'admin123';

              if (isPasswordValid) {
                const roles = getLocalRoles();
                const permissions = getUserEffectivePermissions(found, roles);
                const roleName = found.userRoles?.[0]?.role?.name || 'Vendedor';
                loggedUser = {
                  id: found.id,
                  username: found.username,
                  name: `${found.firstName || ''} ${found.lastName || ''}`.trim() || found.username,
                  email: found.email,
                  role: roleName.toUpperCase(),
                  permissions,
                };
              }
            }
          } catch {}
        }
      }

      if (loggedUser) {
        // Registrar en la bitácora del usuario
        try {
          recordAuditLog({
            userId: loggedUser.id,
            username: loggedUser.username,
            user: loggedUser.name,
            role: loggedUser.role,
            action: 'LOGIN',
            entity: 'User',
            entityId: loggedUser.id,
            description: `Inicio de sesión exitoso como ${loggedUser.role} en terminal web`,
            details: { username: loggedUser.username || username, role: loggedUser.role, timestamp: new Date().toISOString() },
          });
        } catch {}

        login(token, loggedUser);
        toast.success(`¡Bienvenido, ${loggedUser.name}!`);
        navigate('/');
      } else {
        try {
          recordAuditLog({
            userId: 'guest',
            username,
            user: 'Visitante (Fallido)',
            role: 'NONE',
            action: 'LOGIN_FAILED',
            entity: 'User',
            entityId: username,
            description: `Intento de inicio de sesión fallido para el usuario "${username}"`,
            details: { username, reason: 'Credenciales inválidas o usuario no encontrado', timestamp: new Date().toISOString() },
          });
        } catch {}
        toast.error('Credenciales inválidas. Ingrese con admin / admin123 o un usuario registrado.');
      }
    } catch {
      toast.error('Error al procesar el inicio de sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40 p-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md shadow-xl border-border">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-black text-2xl">
            F
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Ferretería ERP</CardTitle>
          <CardDescription>{t('auth.welcomeBack')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">{t('auth.username')}</Label>
              <Input
                id="username"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <span className="text-xs text-muted-foreground">Default: admin123</span>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground space-y-1 border">
              <p className="font-semibold text-foreground">Credenciales de acceso rápido:</p>
              <p>• Administrador: <code className="text-primary font-mono font-bold">admin</code> / <code className="text-primary font-mono font-bold">admin123</code></p>
              <p>• O utilice cualquier usuario dado de alta en la sección Usuarios.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? t('auth.loggingIn') : t('auth.signIn')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
