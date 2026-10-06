import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { telemetry } from './services/telemetry.service';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/products/ProductsPage';
import ProductFormPage from './pages/products/ProductFormPage';
import CategoriesPage from './pages/categories/CategoriesPage';
import LoginPage from './pages/LoginPage';
import InventoryPage from './pages/inventory/InventoryPage';
import SuppliersPage from './pages/suppliers/SuppliersPage';
import PurchasesPage from './pages/purchases/PurchasesPage';
import NewPurchasePage from './pages/purchases/NewPurchasePage';
import { PosPage } from './pages/pos/PosPage';
import { QuotesPage } from './pages/quotes/QuotesPage';
import { SalesPage } from './pages/sales/SalesPage';
import { CashRegisterPage } from './pages/cash/CashRegisterPage';
import CustomersPage from './pages/customers/CustomersPage';
import CustomerProfilesPage from './pages/customers/CustomerProfilesPage';
import InvoicingPage from './pages/invoicing/InvoicingPage';
import EcommerceSalesPage from './pages/ecommerce/EcommerceSalesPage';
import ReportsPage from './pages/reports/ReportsPage';
import AuditPage from './pages/audit/AuditPage';
import UsersPage from './pages/users/UsersPage';
import SettingsPage from './pages/settings/SettingsPage';
import { useAuthStore } from './stores/auth.store';
import { useEffect } from 'react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, checkAuth } = useAuthStore();
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
          <Route path="usuarios" element={<UsersPage />} />
          <Route path="auditoria" element={<AuditPage />} />
          <Route path="configuracion" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
