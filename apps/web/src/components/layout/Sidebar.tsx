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

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  disabled?: boolean;
  adminOnly?: boolean;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Productos', href: '/productos', icon: Package },
  { name: 'Categorías', href: '/categorias', icon: Tags },
  { name: 'Inventario', href: '/inventario', icon: Warehouse },
  { name: 'Punto de Venta', href: '/pos', icon: ShoppingCart },
  { name: 'Presupuestos', href: '/presupuestos', icon: FileSpreadsheet },
  { name: 'Ventas', href: '/ventas', icon: Receipt },
  { name: 'E-commerce', href: '/ecommerce', icon: Globe },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Perfiles & Churn', href: '/clientes/perfiles', icon: Brain },
  { name: 'Proveedores', href: '/proveedores', icon: Truck },
  { name: 'Compras', href: '/compras', icon: Receipt },
  { name: 'Facturación', href: '/facturacion', icon: FileText },
  { name: 'Caja', href: '/caja', icon: DollarSign },
  { name: 'Reportes', href: '/reportes', icon: BarChart3 },
  { name: 'Usuarios', href: '/usuarios', icon: UserCog },
  { name: 'Auditoría', href: '/auditoria', icon: Shield, adminOnly: true },
  { name: 'Configuración', href: '/configuracion', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const isAdmin = useAuthStore((state) => state.isAdmin());


  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center px-6 border-b">
        <h1 className="text-xl font-bold text-primary">Ferretería</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navigation.map((item) => {
          if (item.adminOnly && !isAdmin) return null;

          const isActive = location.pathname === item.href || 
                           (item.href !== '/' && item.href !== '/clientes' && location.pathname.startsWith(item.href));
          
          return item.disabled ? (
            <div
              key={item.name}
              className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-muted-foreground opacity-50 cursor-not-allowed"
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </div>
          ) : (
            <Link
              key={item.name}
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
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
