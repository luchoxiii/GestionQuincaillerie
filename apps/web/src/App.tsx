import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import React, { Component, lazy, Suspense, useEffect } from 'react';
import { telemetry } from './services/telemetry.service';
import DashboardLayout from './components/layout/DashboardLayout';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { useAuthStore } from './stores/auth.store';
import { AlertTriangle, Lock, RefreshCw } from 'lucide-react';
import { Button } from './components/ui/button';

// Lazy-loaded route pages for performance & memory optimization
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProductsPage = lazy(() => import('./pages/products/ProductsPage'));
const ProductFormPage = lazy(() => import('./pages/products/ProductFormPage'));
const CategoriesPage = lazy(() => import('./pages/categories/CategoriesPage'));
const InventoryPage = lazy(() => import('./pages/inventory/InventoryPage'));
const SuppliersPage = lazy(() => import('./pages/suppliers/SuppliersPage'));
const PurchasesPage = lazy(() => import('./pages/purchases/PurchasesPage'));
const NewPurchasePage = lazy(() => import('./pages/purchases/NewPurchasePage'));
const PosPage = lazy(() => import('./pages/pos/PosPage').then(m => ({ default: m.PosPage })));
const QuotesPage = lazy(() => import('./pages/quotes/QuotesPage').then(m => ({ default: m.QuotesPage })));
const SalesPage = lazy(() => import('./pages/sales/SalesPage').then(m => ({ default: m.SalesPage })));
const CashRegisterPage = lazy(() => import('./pages/cash/CashRegisterPage').then(m => ({ default: m.CashRegisterPage })));
const CustomersPage = lazy(() => import('./pages/customers/CustomersPage'));
const CustomerProfilesPage = lazy(() => import('./pages/customers/CustomerProfilesPage'));
const InvoicingPage = lazy(() => import('./pages/invoicing/InvoicingPage'));
const EcommerceSalesPage = lazy(() => import('./pages/ecommerce/EcommerceSalesPage'));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'));
const AuditPage = lazy(() => import('./pages/audit/AuditPage'));
const UsersPage = lazy(() => import('./pages/users/UsersPage'));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));

function PageLoader() {
  return (
    <div className="min-h-[50vh] w-full flex items-center justify-center p-8">
      <LoadingSpinner text="Cargando módulo..." />
    </div>
  );
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-muted/40 p-6">
          <div className="max-w-md w-full rounded-xl border bg-card p-6 shadow-xl text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Ocurrió un problema al cargar la vista</h2>
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message || 'Error inesperado de renderizado o carga de módulo.'}
            </p>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Recargar aplicación
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function ProtectedRoute({
  children,
  requiredPermission,
  adminOnly,
}: {
  children: React.ReactNode;
  requiredPermission?: string;
  adminOnly?: boolean;
}) {
  const { isAuthenticated, checkAuth, isAdmin, hasPermission } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto min-h-[60vh]">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive">
          <Lock className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Acceso Restringido: Solo Administrador</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Esta sección requiere privilegios de <strong>Administrador</strong> para acceder.
        </p>
      </div>
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto min-h-[60vh]">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive">
          <Lock className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Permiso Insuficiente</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          No cuenta con el permiso requerido (<code className="font-mono">{requiredPermission}</code>) para acceder a este módulo.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

function TelemetryTracker() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    telemetry.init();
  }, []);

  useEffect(() => {
    if (user) {
      telemetry.trackUserLogin({
        id: user.id,
        username: user.username || user.name,
        name: user.name,
        role: user.role,
        email: user.email,
      });
    }
  }, [user?.id, user?.name]);

  useEffect(() => {
    telemetry.trackNavigation(location.pathname);
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <TelemetryTracker />
      <Toaster position="top-right" />
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="productos">
                <Route index element={<ProductsPage />} />
                <Route path="nuevo" element={<ProductFormPage />} />
                <Route path=":id" element={<ProductFormPage />} />
              </Route>
              <Route path="categorias" element={<CategoriesPage />} />
              <Route path="inventario" element={<InventoryPage />} />
              <Route path="proveedores" element={<SuppliersPage />} />
              <Route path="compras">
                <Route index element={<PurchasesPage />} />
                <Route path="nueva" element={<NewPurchasePage />} />
              </Route>
              <Route path="pos" element={<PosPage />} />
              <Route path="presupuestos" element={<QuotesPage />} />
              <Route path="ventas" element={<SalesPage />} />
              <Route path="ecommerce" element={<EcommerceSalesPage />} />
              <Route path="clientes" element={<CustomersPage />} />
              <Route path="clientes/perfiles" element={<CustomerProfilesPage />} />
              <Route path="caja" element={<CashRegisterPage />} />
              <Route path="facturacion" element={<InvoicingPage />} />
              <Route path="reportes" element={<ReportsPage />} />
              <Route
                path="usuarios"
                element={
                  <ProtectedRoute requiredPermission="users:read">
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="auditoria"
                element={
                  <ProtectedRoute adminOnly>
                    <AuditPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="configuracion"
                element={
                  <ProtectedRoute adminOnly>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
