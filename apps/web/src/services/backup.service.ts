export interface ErpBackupMetadata {
  version: string;
  appName: string;
  createdAt: string;
  exportedBy?: string;
  totals: {
    products: number;
    customers: number;
    sales: number;
    quotes: number;
    purchases: number;
    suppliers: number;
    categories: number;
    coupons: number;
  };
}

export interface ErpBackupSnapshot {
  metadata: ErpBackupMetadata;
  data: {
    products: any[];
    customers: any[];
    sales: any[];
    quotes: any[];
    cashSession: any | null;
    cashMovements: any[];
    categories: any[];
    purchases: any[];
    suppliers: any[];
    settings: any | null;
    coupons: any[];
    auditLogs: any[];
    users: any[];
    roles: any[];
    ecommerceOrders: any[];
  };
}

const STORAGE_KEYS = {
  products: 'ferreteria_local_products',
  customers: 'ferreteria_local_customers',
  sales: 'ferreteria_local_sales',
  quotes: 'ferreteria_local_quotes',
  cashSession: 'ferreteria_local_cash_session',
  cashMovements: 'ferreteria_local_cash_movements',
  categories: 'ferreteria_local_categories',
  purchases: 'ferreteria_local_purchases',
  suppliers: 'ferreteria_local_suppliers',
  settings: 'ferreteria_company_settings',
  coupons: 'ferreteria_local_coupons',
  auditLogs: 'ferreteria_local_audit_logs',
  users: 'ferreteria_custom_users',
  roles: 'ferreteria_custom_roles',
  ecommerceOrders: 'ferreteria_ecommerce_orders',
};

function readLocalStorageArray(key: string): any[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readLocalStorageObject(key: string): any {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Genera un snapshot completo con todos los datos del ERP
 */
export function createBackupSnapshot(exportedBy = 'Administrador'): ErpBackupSnapshot {
  const products = readLocalStorageArray(STORAGE_KEYS.products);
  const customers = readLocalStorageArray(STORAGE_KEYS.customers);
  const sales = readLocalStorageArray(STORAGE_KEYS.sales);
  const quotes = readLocalStorageArray(STORAGE_KEYS.quotes);
  const cashSession = readLocalStorageObject(STORAGE_KEYS.cashSession);
  const cashMovements = readLocalStorageArray(STORAGE_KEYS.cashMovements);
  const categories = readLocalStorageArray(STORAGE_KEYS.categories);
  const purchases = readLocalStorageArray(STORAGE_KEYS.purchases);
  const suppliers = readLocalStorageArray(STORAGE_KEYS.suppliers);
  const settings = readLocalStorageObject(STORAGE_KEYS.settings);
  const coupons = readLocalStorageArray(STORAGE_KEYS.coupons);
  const auditLogs = readLocalStorageArray(STORAGE_KEYS.auditLogs);
  const users = readLocalStorageArray(STORAGE_KEYS.users);
  const roles = readLocalStorageArray(STORAGE_KEYS.roles);
  const ecommerceOrders = readLocalStorageArray(STORAGE_KEYS.ecommerceOrders);

  const now = new Date();

  return {
    metadata: {
      version: '2.5.0-ferreteria-corralon',
      appName: 'GestionQuincaillerie Ferretería & Corralón ERP',
      createdAt: now.toISOString(),
      exportedBy,
      totals: {
        products: products.length,
        customers: customers.length,
        sales: sales.length,
        quotes: quotes.length,
        purchases: purchases.length,
        suppliers: suppliers.length,
        categories: categories.length,
        coupons: coupons.length,
      },
    },
    data: {
      products,
      customers,
      sales,
      quotes,
      cashSession,
      cashMovements,
      categories,
      purchases,
      suppliers,
      settings,
      coupons,
      auditLogs,
      users,
      roles,
      ecommerceOrders,
    },
  };
}

/**
 * Descarga el archivo de backup en formato JSON localmente
 */
export function downloadBackupFile(snapshot?: ErpBackupSnapshot): string {
  const backup = snapshot || createBackupSnapshot();
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
  const filename = `backup_ferreteria_${dateStr}.json`;

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return filename;
}

/**
 * Valida si una cadena JSON o un archivo contiene una copia de seguridad legítima
 */
export function validateBackupFile(jsonString: string): {
  isValid: boolean;
  error?: string;
  snapshot?: ErpBackupSnapshot;
} {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { isValid: false, error: 'El archivo no contiene un objeto JSON válido' };
    }

    if (!parsed.metadata || !parsed.data) {
      return { isValid: false, error: 'Estructura de copia de seguridad incompatible (falta metadata o data)' };
    }

    if (!Array.isArray(parsed.data.products) || !Array.isArray(parsed.data.customers)) {
      return { isValid: false, error: 'El respaldo no contiene las tablas mínimas de productos o clientes' };
    }

    return { isValid: true, snapshot: parsed as ErpBackupSnapshot };
  } catch (e: any) {
    return { isValid: false, error: 'Error al parsear el archivo JSON: ' + (e.message || 'Formato corrupto') };
  }
}

/**
 * Restaura el snapshot completo en el almacenamiento local
 */
export function restoreBackupSnapshot(snapshot: ErpBackupSnapshot): {
  success: boolean;
  stats: Record<string, number>;
} {
  const { data } = snapshot;

  if (Array.isArray(data.products)) {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(data.products));
  }
  if (Array.isArray(data.customers)) {
    localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(data.customers));
  }
  if (Array.isArray(data.sales)) {
    localStorage.setItem(STORAGE_KEYS.sales, JSON.stringify(data.sales));
  }
  if (Array.isArray(data.quotes)) {
    localStorage.setItem(STORAGE_KEYS.quotes, JSON.stringify(data.quotes));
  }
  if (data.cashSession !== undefined) {
    localStorage.setItem(STORAGE_KEYS.cashSession, JSON.stringify(data.cashSession));
  }
  if (Array.isArray(data.cashMovements)) {
    localStorage.setItem(STORAGE_KEYS.cashMovements, JSON.stringify(data.cashMovements));
  }
  if (Array.isArray(data.categories)) {
    localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(data.categories));
  }
  if (Array.isArray(data.purchases)) {
    localStorage.setItem(STORAGE_KEYS.purchases, JSON.stringify(data.purchases));
  }
  if (Array.isArray(data.suppliers)) {
    localStorage.setItem(STORAGE_KEYS.suppliers, JSON.stringify(data.suppliers));
  }
  if (data.settings) {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(data.settings));
  }
  if (Array.isArray(data.coupons)) {
    localStorage.setItem(STORAGE_KEYS.coupons, JSON.stringify(data.coupons));
  }
  if (Array.isArray(data.auditLogs)) {
    localStorage.setItem(STORAGE_KEYS.auditLogs, JSON.stringify(data.auditLogs));
  }
  if (Array.isArray(data.users)) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(data.users));
  }
  if (Array.isArray(data.roles)) {
    localStorage.setItem(STORAGE_KEYS.roles, JSON.stringify(data.roles));
  }
  if (Array.isArray(data.ecommerceOrders)) {
    localStorage.setItem(STORAGE_KEYS.ecommerceOrders, JSON.stringify(data.ecommerceOrders));
  }

  // Notificar a las pestañas y componentes
  window.dispatchEvent(new Event('storage'));

  return {
    success: true,
    stats: {
      products: data.products?.length || 0,
      customers: data.customers?.length || 0,
      sales: data.sales?.length || 0,
      quotes: data.quotes?.length || 0,
      purchases: data.purchases?.length || 0,
      suppliers: data.suppliers?.length || 0,
      categories: data.categories?.length || 0,
    },
  };
}
