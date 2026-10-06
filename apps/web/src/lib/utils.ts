import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { recordAuditLog } from "@/services/audit.service"
import { useAuthStore } from "@/stores/auth.store"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ActiveCurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  locale: string;
  decimals: number;
}

let cachedCurrencyConfig: ActiveCurrencyConfig | null = null;

export function getActiveCurrencyConfig(): ActiveCurrencyConfig {
  if (cachedCurrencyConfig) return cachedCurrencyConfig;
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('ferreteria_local_settings') : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.currencyCode || parsed.currency_code) {
        cachedCurrencyConfig = {
          code: parsed.currencyCode || parsed.currency_code || 'ARS',
          name: parsed.currencyName || 'Peso Argentino',
          symbol: parsed.currencySymbol || parsed.currency_symbol || '$',
          locale: parsed.currencyLocale || parsed.currency_locale || 'es-AR',
          decimals: parsed.currencyDecimals !== undefined ? Number(parsed.currencyDecimals) : 2,
        };
        return cachedCurrencyConfig;
      }
    }
  } catch {}

  return {
    code: 'ARS',
    name: 'Peso Argentino',
    symbol: '$',
    locale: 'es-AR',
    decimals: 2,
  };
}

export function setCachedCurrencyConfig(config: ActiveCurrencyConfig | null) {
  cachedCurrencyConfig = config;
}

export function formatCurrency(
  value: number | string | undefined | null,
  overrideConfig?: Partial<ActiveCurrencyConfig>
): string {
  const num = typeof value === 'string' ? parseFloat(value) : (value || 0);
  const safeNum = isNaN(num) ? 0 : num;
  const config = { ...getActiveCurrencyConfig(), ...overrideConfig };

  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(safeNum);
  } catch {
    const formattedNum = safeNum.toLocaleString(config.locale || 'es-AR', {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    });
    return `${config.symbol} ${formattedNum}`;
  }
}

export function exportToCsv(filename: string, rows: (string | number | boolean | null | undefined)[][]) {
  const escapeCell = (cell: any) => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = '\uFEFF' + rows.map(row => row.map(escapeCell).join(';')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // Automatically log CSV exports to the audit ledger
  try {
    const user = useAuthStore.getState().user;
    if (user && !filename.includes('bitacora_forense')) {
      recordAuditLog({
        userId: user.id,
        user: user.name,
        role: user.role,
        action: 'CSV_EXPORT',
        entity: 'System',
        entityId: filename,
        description: `Descarga de archivo CSV: ${filename}`,
        details: { filename, rowsCount: rows.length }
      });
    }
  } catch {}
}
