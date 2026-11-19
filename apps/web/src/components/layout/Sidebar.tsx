import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Tags,
  Warehouse,
  ShoppingCart,
  Users,
  Truck,
  Receipt,
  FileText,
  DollarSign,
  BarChart3,
  UserCog,
  Settings,
  Shield,
  Brain,
  Globe,
  FileSpreadsheet,
} from 'lucide-react';

import { useAuthStore } from '@/stores/auth.store';
import { useI18n } from '@/i18n';

interface NavigationItem {
  key: string;
  defaultName: string;
  href: string;
  icon: any;
  disabled?: boolean;
  adminOnly?: boolean;
  permission?: string;
}

const navigation: NavigationItem[] = [
  { key: 'dashboard', defaultName: 'Dashboard', href: '/', icon: LayoutDashboard },
  { key: 'products', defaultName: 'Productos', href: '/productos', icon: Package, permission: 'products:read' },
  { key: 'categories', defaultName: 'Categorías', href: '/categorias', icon: Tags, permission: 'products:read' },
  { key: 'inventory', defaultName: 'Inventario', href: '/inventario', icon: Warehouse, permission: 'products:read' },
  { key: 'pos', defaultName: 'Punto de Venta', href: '/pos', icon: ShoppingCart, permission: 'pos:access' },
  { key: 'quotes', defaultName: 'Presupuestos', href: '/presupuestos', icon: FileSpreadsheet, permission: 'sales:read' },
  { key: 'sales', defaultName: 'Ventas', href: '/ventas', icon: Receipt, permission: 'sales:read' },
  { key: 'ecommerce', defaultName: 'E-commerce', href: '/ecommerce', icon: Globe, permission: 'ecommerce:read' },
  { key: 'customers', defaultName: 'Clientes', href: '/clientes', icon: Users, permission: 'customers:read' },
  { key: 'profiles', defaultName: 'Perfiles & Churn', href: '/clientes/perfiles', icon: Brain, permission: 'customers:read' },
  { key: 'suppliers', defaultName: 'Proveedores', href: '/proveedores', icon: Truck, permission: 'purchases:read' },
  { key: 'purchases', defaultName: 'Compras', href: '/compras', icon: Receipt, permission: 'purchases:read' },
  { key: 'invoicing', defaultName: 'Facturación', href: '/facturacion', icon: FileText, permission: 'sales:read' },
  { key: 'cash', defaultName: 'Caja', href: '/caja', icon: DollarSign, permission: 'cash:open' },
  { key: 'reports', defaultName: 'Reportes', href: '/reportes', icon: BarChart3, permission: 'sales:read' },
  { key: 'users', defaultName: 'Usuarios', href: '/usuarios', icon: UserCog, permission: 'users:read' },
  { key: 'audit', defaultName: 'Auditoría', href: '/auditoria', icon: Shield, adminOnly: true },
  { key: 'settings', defaultName: 'Configuración', href: '/configuracion', icon: Settings, adminOnly: true },
];

export default function Sidebar() {
  const location = useLocation();
  const isAdmin = useAuthStore((state) => state.isAdmin());
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const userPermissions = useAuthStore((state) => state.user?.permissions);
  const { t } = useI18n();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center px-6 border-b">
        <h1 className="text-xl font-bold text-primary">Ferretería</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navigation.map((item) => {
          if (item.adminOnly && !isAdmin) return null;
          if (
            item.permission &&
            !isAdmin &&
            (item.permission === 'users:read' || (Array.isArray(userPermissions) && userPermissions.length > 0)) &&
            !hasPermission(item.permission)
          ) {
            return null;
          }

          const isActive = location.pathname === item.href || 
                           (item.href !== '/' && item.href !== '/clientes' && location.pathname.startsWith(item.href));
          
          const label = t(`nav.${item.key}`) || item.defaultName;

          return item.disabled ? (
            <div
              key={item.key}
              className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-muted-foreground opacity-50 cursor-not-allowed"
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {label}
            </div>
          ) : (
            <Link
              key={item.key}
              to={item.href}
              className={cn(
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground',
                'group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors'
              )}
            >
              <item.icon
                className={cn(
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-accent-foreground',
                  'mr-3 h-5 w-5 flex-shrink-0'
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
