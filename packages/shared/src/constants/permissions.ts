import { UserRole } from '../types/enums';

export enum AppPermission {
  DASHBOARD_VIEW = 'dashboard.view',
  
  PRODUCTS_VIEW = 'products.view',
  PRODUCTS_CREATE = 'products.create',
  PRODUCTS_EDIT = 'products.edit',
  PRODUCTS_DELETE = 'products.delete',
  PRODUCTS_IMPORT = 'products.import',
  PRODUCTS_EXPORT = 'products.export',
  PRODUCTS_MASS_PRICE_UPDATE = 'products.mass_price_update',
  
  INVENTORY_VIEW = 'inventory.view',
  INVENTORY_ADJUST = 'inventory.adjust',
  INVENTORY_TRANSFER = 'inventory.transfer',
  INVENTORY_COUNT = 'inventory.count',
  
  POS_CREATE_SALE = 'pos.create_sale',
  POS_VOID_SALE = 'pos.void_sale',
  POS_RETURN = 'pos.return',
  POS_APPLY_DISCOUNT = 'pos.apply_discount',
  
  SALES_VIEW = 'sales.view',
  
  INVOICES_VIEW = 'invoices.view',
  INVOICES_CREATE = 'invoices.create',
  INVOICES_VOID = 'invoices.void',
  INVOICES_AFIP = 'invoices.afip',
  
  CUSTOMERS_VIEW = 'customers.view',
  CUSTOMERS_CREATE = 'customers.create',
  CUSTOMERS_EDIT = 'customers.edit',
  CUSTOMERS_PAYMENTS = 'customers.payments',
  
  SUPPLIERS_VIEW = 'suppliers.view',
  SUPPLIERS_CREATE = 'suppliers.create',
  SUPPLIERS_EDIT = 'suppliers.edit',
  SUPPLIERS_PAYMENTS = 'suppliers.payments',
  
  PURCHASES_VIEW = 'purchases.view',
  PURCHASES_CREATE = 'purchases.create',
  
  CASH_OPEN = 'cash.open',
  CASH_CLOSE = 'cash.close',
  CASH_MOVEMENT = 'cash.movement',
  CASH_VIEW_ALL = 'cash.view_all',
  
  REPORTS_SALES = 'reports.sales',
  REPORTS_INVENTORY = 'reports.inventory',
  REPORTS_FINANCIAL = 'reports.financial',
  REPORTS_FISCAL = 'reports.fiscal',
  
  USERS_VIEW = 'users.view',
  USERS_CREATE = 'users.create',
  USERS_EDIT = 'users.edit',
  USERS_PERMISSIONS = 'users.permissions',
  
  SETTINGS_VIEW = 'settings.view',
  SETTINGS_EDIT = 'settings.edit',
  
  AUDIT_VIEW = 'audit.view'
}

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, AppPermission[]> = {
  [UserRole.ADMIN]: Object.values(AppPermission),
  
  [UserRole.ENCARGADO]: [
    AppPermission.DASHBOARD_VIEW,
    AppPermission.PRODUCTS_VIEW, AppPermission.PRODUCTS_CREATE, AppPermission.PRODUCTS_EDIT, AppPermission.PRODUCTS_MASS_PRICE_UPDATE,
    AppPermission.INVENTORY_VIEW, AppPermission.INVENTORY_ADJUST, AppPermission.INVENTORY_TRANSFER, AppPermission.INVENTORY_COUNT,
    AppPermission.POS_CREATE_SALE, AppPermission.POS_VOID_SALE, AppPermission.POS_RETURN, AppPermission.POS_APPLY_DISCOUNT,
    AppPermission.SALES_VIEW,
    AppPermission.INVOICES_VIEW, AppPermission.INVOICES_CREATE, AppPermission.INVOICES_VOID, AppPermission.INVOICES_AFIP,
    AppPermission.CUSTOMERS_VIEW, AppPermission.CUSTOMERS_CREATE, AppPermission.CUSTOMERS_EDIT, AppPermission.CUSTOMERS_PAYMENTS,
    AppPermission.SUPPLIERS_VIEW, AppPermission.SUPPLIERS_CREATE, AppPermission.SUPPLIERS_EDIT, AppPermission.SUPPLIERS_PAYMENTS,
    AppPermission.PURCHASES_VIEW, AppPermission.PURCHASES_CREATE,
    AppPermission.CASH_OPEN, AppPermission.CASH_CLOSE, AppPermission.CASH_MOVEMENT, AppPermission.CASH_VIEW_ALL,
    AppPermission.REPORTS_SALES, AppPermission.REPORTS_INVENTORY, AppPermission.REPORTS_FINANCIAL
  ],
  
  [UserRole.VENDEDOR]: [
    AppPermission.DASHBOARD_VIEW,
    AppPermission.PRODUCTS_VIEW,
    AppPermission.INVENTORY_VIEW,
    AppPermission.POS_CREATE_SALE, AppPermission.POS_RETURN,
    AppPermission.SALES_VIEW,
    AppPermission.INVOICES_VIEW, AppPermission.INVOICES_CREATE,
    AppPermission.CUSTOMERS_VIEW, AppPermission.CUSTOMERS_CREATE, AppPermission.CUSTOMERS_PAYMENTS,
    AppPermission.CASH_OPEN, AppPermission.CASH_CLOSE, AppPermission.CASH_MOVEMENT
  ],
  
  [UserRole.DEPOSITO]: [
    AppPermission.PRODUCTS_VIEW,
    AppPermission.INVENTORY_VIEW, AppPermission.INVENTORY_ADJUST, AppPermission.INVENTORY_TRANSFER, AppPermission.INVENTORY_COUNT,
    AppPermission.PURCHASES_VIEW
  ]
};
