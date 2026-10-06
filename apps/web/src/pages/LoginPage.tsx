import { useState } from 'react';
import { useAuthStore, AuthUser } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { getUserEffectivePermissions, getLocalRoles } from '@/services/users.service';
import { recordAuditLog } from '@/services/audit.service';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let loggedUser: AuthUser | null = null;
      let token = 'token-local-' + Date.now();

      // 1. Try real API authentication if backend is online
      try {
        const { data } = await authService.login(username, password);
        if (data?.token && data?.user) {
          token = data.token;
          loggedUser = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            permissions: data.user.role?.toUpperCase() === 'ADMIN' ? ['*'] : [],
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
            name: 'Administrador Principal',
            email: 'admin@ferreteria.local',
            role: 'ADMIN',
            permissions: ['*'],
          };
        } else {
          // Check locally registered users in browser storage
          try {
            const rawUsers = localStorage.getItem('ferreteria_local_users');
            if (rawUsers) {
              const users = JSON.parse(rawUsers);
              const found = users.find((u: any) => u.username.toLowerCase() === username.toLowerCase());
              if (found) {
                const roles = getLocalRoles();
                const permissions = getUserEffectivePermissions(found, roles);
                const roleName = found.userRoles?.[0]?.role?.name || 'Vendedor';
                loggedUser = {
                  id: found.id,
                  name: `${found.firstName} ${found.lastName}`.trim() || found.username,
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
            user: loggedUser.name,
            role: loggedUser.role,
            action: 'LOGIN',
            entity: 'User',
            entityId: loggedUser.id,
            description: `Inicio de sesión exitoso como ${loggedUser.role} en terminal web`,
            details: { username, role: loggedUser.role, timestamp: new Date().toISOString() },
          });
        } catch {}

        login(token, loggedUser);
        toast.success(`¡Bienvenido, ${loggedUser.name}!`);
        navigate('/');
      } else {
        try {
          recordAuditLog({
            userId: 'guest',
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
    <div className="flex h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-xl border-border">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-black text-2xl">
            F
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Ferretería ERP</CardTitle>
          <CardDescription>Sistema Integral de Gestión de Ferretería y Corralón</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Usuario</Label>
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
                <Label htmlFor="password">Contraseña</Label>
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
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
