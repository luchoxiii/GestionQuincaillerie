import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { setCachedCurrencyConfig } from '@/lib/utils';
import { AVAILABLE_CURRENCIES, DEFAULT_CURRENCY, CurrencyConfig } from '@ferreteria/shared';

export { AVAILABLE_CURRENCIES, DEFAULT_CURRENCY };
export type { CurrencyConfig };

export interface CompanySettings {
  businessName: string;
  fantasyName: string;
  cuit: string;
  ivaCondition: string;
  grossIncome: string;
  activityStartDate: string;
  address: string;
  phone: string;
  email: string;
  defaultPos: string;
  currencyCode?: string;
  currencyName?: string;
  currencySymbol?: string;
  currencyLocale?: string;
  currencyDecimals?: number;
  dollarExchangeRate?: number;
}

export interface MeliSettings {
  appId: string;
  clientSecret: string;
  redirectUri: string;
  webhookSecret: string;
  sellerId: string;
  sandboxMode: boolean;
  autoSyncOrders: boolean;
  syncFrequencyMinutes: number;
  isConnected: boolean;
  lastSyncAt?: string | null;
}

export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword?: string;
  fromEmail: string;
  fromName: string;
  secure: 'ssl' | 'tls' | 'none';
  sendReceiptOnSale: boolean;
  adminBccEmail: string;
}

export interface CommercialPoliciesSettings {
  blackCashDiscountEnabled: boolean;
  blackCashDiscountPercent: number;
}

const STORAGE_SETTINGS_KEY = 'ferreteria_local_settings';
const STORAGE_MELI_KEY = 'ferreteria_meli_settings';
const STORAGE_EMAIL_KEY = 'ferreteria_email_settings';
const STORAGE_POLICIES_KEY = 'ferreteria_commercial_policies';

const DEFAULT_SETTINGS: CompanySettings = {
  businessName: 'Ferretería Central S.A.',
  fantasyName: 'Los Hnos Ferreteros',
  cuit: '30-12345678-9',
  ivaCondition: 'Responsable Inscripto',
  grossIncome: '901-12345678-9',
  activityStartDate: '2020-01-01',
  address: 'Av. Corrientes 1234, CABA',
  phone: '11-4321-8765',
  email: 'contacto@ferreteriacentral.com.ar',
  defaultPos: '0001',
  currencyCode: DEFAULT_CURRENCY.code,
  currencyName: DEFAULT_CURRENCY.name,
  currencySymbol: DEFAULT_CURRENCY.symbol,
  currencyLocale: DEFAULT_CURRENCY.locale,
  currencyDecimals: DEFAULT_CURRENCY.decimals,
  dollarExchangeRate: 1350,
};

export function getStoredDollarExchangeRate(): number {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.dollarExchangeRate && !isNaN(Number(parsed.dollarExchangeRate))) {
        return Number(parsed.dollarExchangeRate);
      }
    }
  } catch (e) {
    // ignore
  }
  return 1350;
}

export const DEFAULT_MELI_SETTINGS: MeliSettings = {
  appId: '',
  clientSecret: '',
  redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/api/ecommerce/meli/callback` : 'http://localhost:4000/api/ecommerce/meli/callback',
  webhookSecret: '',
  sellerId: '',
  sandboxMode: false,
  autoSyncOrders: true,
  syncFrequencyMinutes: 15,
  isConnected: false,
  lastSyncAt: null,
};

export const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  smtpUser: 'facturacion@ferreteriacentral.com.ar',
  smtpPassword: '',
  fromEmail: 'facturacion@ferreteriacentral.com.ar',
  fromName: 'Ferretería Central - Facturación & Mostrador',
  secure: 'tls',
  sendReceiptOnSale: true,
  adminBccEmail: 'auditoria@ferreteriacentral.com.ar',
};

export const DEFAULT_COMMERCIAL_POLICIES: CommercialPoliciesSettings = {
  blackCashDiscountEnabled: true,
  blackCashDiscountPercent: 10,
};

// ---------------- COMPANY SETTINGS ----------------

function syncCurrencyCache(settings: CompanySettings) {
  setCachedCurrencyConfig({
    code: settings.currencyCode || DEFAULT_CURRENCY.code,
    name: settings.currencyName || DEFAULT_CURRENCY.name,
    symbol: settings.currencySymbol || DEFAULT_CURRENCY.symbol,
    locale: settings.currencyLocale || DEFAULT_CURRENCY.locale,
    decimals: settings.currencyDecimals !== undefined ? Number(settings.currencyDecimals) : DEFAULT_CURRENCY.decimals,
  });
}

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/settings');
        if (data && data.businessName) {
          const merged = { ...DEFAULT_SETTINGS, ...data };
          localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(merged));
          syncCurrencyCache(merged);
          return merged as CompanySettings;
        }
      } catch {}

      try {
        const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
        if (raw) {
          const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
          syncCurrencyCache(parsed);
          return parsed as CompanySettings;
        }
      } catch {}

      syncCurrencyCache(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    },
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: Partial<CompanySettings>) => {
      try {
        await api.put('/settings', settings);
      } catch {}

      let current = DEFAULT_SETTINGS;
      try {
        const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
        if (raw) current = JSON.parse(raw);
      } catch {}

      const updated = { ...current, ...settings };
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(updated));
      syncCurrencyCache(updated);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};

// ---------------- MERCADO LIBRE SETTINGS ----------------

export function getLocalMeliSettings(): MeliSettings {
  try {
    const raw = localStorage.getItem(STORAGE_MELI_KEY);
    if (raw) return { ...DEFAULT_MELI_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_MELI_SETTINGS;
}

export function saveLocalMeliSettings(settings: Partial<MeliSettings>): MeliSettings {
  const current = getLocalMeliSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(STORAGE_MELI_KEY, JSON.stringify(updated));
  return updated;
}

export const useMeliSettings = () => {
  return useQuery({
    queryKey: ['settings', 'meli'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/settings');
        if (data && (data.meli_app_id || data.appId)) {
          const mapped: MeliSettings = {
            appId: data.meli_app_id || data.appId || '',
            clientSecret: data.meli_client_secret || data.clientSecret || '',
            redirectUri: data.meli_redirect_uri || data.redirectUri || DEFAULT_MELI_SETTINGS.redirectUri,
            webhookSecret: data.meli_webhook_secret || data.webhookSecret || '',
            sellerId: data.meli_seller_id || data.sellerId || '',
            sandboxMode: data.meli_sandbox === 'true' || Boolean(data.sandboxMode),
            autoSyncOrders: data.meli_auto_sync === 'true' || Boolean(data.autoSyncOrders),
            syncFrequencyMinutes: Number(data.meli_sync_freq || data.syncFrequencyMinutes || 15),
            isConnected: Boolean(data.meli_connected || data.isConnected),
            lastSyncAt: data.meli_last_sync || data.lastSyncAt || null,
          };
          localStorage.setItem(STORAGE_MELI_KEY, JSON.stringify(mapped));
          return mapped;
        }
      } catch {}

      return getLocalMeliSettings();
    },
  });
};

export const useUpdateMeliSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<MeliSettings>) => {
      try {
        await api.put('/settings', {
          meli_app_id: settings.appId,
          meli_client_secret: settings.clientSecret,
          meli_redirect_uri: settings.redirectUri,
          meli_webhook_secret: settings.webhookSecret,
          meli_seller_id: settings.sellerId,
          meli_sandbox: String(settings.sandboxMode),
          meli_auto_sync: String(settings.autoSyncOrders),
          meli_sync_freq: String(settings.syncFrequencyMinutes),
        });
      } catch {}

      const updated = saveLocalMeliSettings(settings);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'meli'] });
    },
  });
};

// ---------------- EMAIL / SMTP SETTINGS ----------------

export function getLocalEmailSettings(): EmailSettings {
  try {
    const raw = localStorage.getItem(STORAGE_EMAIL_KEY);
    if (raw) return { ...DEFAULT_EMAIL_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_EMAIL_SETTINGS;
}

export function saveLocalEmailSettings(settings: Partial<EmailSettings>): EmailSettings {
  const current = getLocalEmailSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(STORAGE_EMAIL_KEY, JSON.stringify(updated));
  return updated;
}

export const useEmailSettings = () => {
  return useQuery({
    queryKey: ['settings', 'email'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/settings');
        if (data && (data.smtp_host || data.smtpHost)) {
          const mapped: EmailSettings = {
            smtpHost: data.smtp_host || data.smtpHost || DEFAULT_EMAIL_SETTINGS.smtpHost,
            smtpPort: Number(data.smtp_port || data.smtpPort || DEFAULT_EMAIL_SETTINGS.smtpPort),
            smtpUser: data.smtp_user || data.smtpUser || DEFAULT_EMAIL_SETTINGS.smtpUser,
            smtpPassword: data.smtp_pass || data.smtpPassword || '',
            fromEmail: data.email_from || data.fromEmail || DEFAULT_EMAIL_SETTINGS.fromEmail,
            fromName: data.email_name || data.fromName || DEFAULT_EMAIL_SETTINGS.fromName,
            secure: (data.smtp_secure || data.secure || 'tls') as any,
            sendReceiptOnSale: data.send_receipt_on_sale !== 'false',
            adminBccEmail: data.admin_bcc_email || data.adminBccEmail || DEFAULT_EMAIL_SETTINGS.adminBccEmail,
          };
          localStorage.setItem(STORAGE_EMAIL_KEY, JSON.stringify(mapped));
          return mapped;
        }
      } catch {}

      return getLocalEmailSettings();
    },
  });
};

export const useUpdateEmailSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<EmailSettings>) => {
      try {
        await api.put('/settings', {
          smtp_host: settings.smtpHost,
          smtp_port: String(settings.smtpPort),
          smtp_user: settings.smtpUser,
          smtp_pass: settings.smtpPassword,
          email_from: settings.fromEmail,
          email_name: settings.fromName,
          smtp_secure: settings.secure,
          send_receipt_on_sale: String(settings.sendReceiptOnSale),
          admin_bcc_email: settings.adminBccEmail,
        });
      } catch {}

      const updated = saveLocalEmailSettings(settings);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'email'] });
    },
  });
};

// ---------------- POLÍTICAS COMERCIALES (DESCUENTO EFECTIVO EN NEGRO) ----------------

export function getLocalCommercialPolicies(): CommercialPoliciesSettings {
  try {
    const raw = localStorage.getItem(STORAGE_POLICIES_KEY);
    if (raw) return { ...DEFAULT_COMMERCIAL_POLICIES, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_COMMERCIAL_POLICIES;
}

export function saveLocalCommercialPolicies(settings: Partial<CommercialPoliciesSettings>): CommercialPoliciesSettings {
  const current = getLocalCommercialPolicies();
  const updated = { ...current, ...settings };
  localStorage.setItem(STORAGE_POLICIES_KEY, JSON.stringify(updated));
  return updated;
}

export const useCommercialPolicies = () => {
  return useQuery({
    queryKey: ['settings', 'policies'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/settings');
        if (data && data.black_cash_discount_percent !== undefined) {
          const mapped: CommercialPoliciesSettings = {
            blackCashDiscountEnabled: data.black_cash_discount_enabled !== 'false',
            blackCashDiscountPercent: Number(data.black_cash_discount_percent || 10),
          };
          localStorage.setItem(STORAGE_POLICIES_KEY, JSON.stringify(mapped));
          return mapped;
        }
      } catch {}

      return getLocalCommercialPolicies();
    },
  });
};

export const useUpdateCommercialPolicies = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<CommercialPoliciesSettings>) => {
      try {
        await api.put('/settings', {
          black_cash_discount_enabled: String(settings.blackCashDiscountEnabled),
          black_cash_discount_percent: String(settings.blackCashDiscountPercent),
        });
      } catch {}

      const updated = saveLocalCommercialPolicies(settings);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'policies'] });
    },
  });
};
