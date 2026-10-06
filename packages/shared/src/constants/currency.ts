export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  locale: string;
  decimals: number;
}

export const DEFAULT_CURRENCY: CurrencyConfig = {
  code: 'ARS',
  name: 'Peso Argentino (ARS - $)',
  symbol: '$',
  locale: 'es-AR',
  decimals: 2,
};

export const AVAILABLE_CURRENCIES: CurrencyConfig[] = [
  { code: 'ARS', name: 'Peso Argentino (ARS - $)', symbol: '$', locale: 'es-AR', decimals: 2 },
  { code: 'USD', name: 'Dólar Estadounidense (USD - US$)', symbol: 'US$', locale: 'en-US', decimals: 2 },
  { code: 'EUR', name: 'Euro (EUR - €)', symbol: '€', locale: 'es-ES', decimals: 2 },
  { code: 'CLP', name: 'Peso Chileno (CLP - $)', symbol: '$', locale: 'es-CL', decimals: 0 },
  { code: 'UYU', name: 'Peso Uruguayo (UYU - $U)', symbol: '$U', locale: 'es-UY', decimals: 2 },
  { code: 'BRL', name: 'Real Brasileño (BRL - R$)', symbol: 'R$', locale: 'pt-BR', decimals: 2 },
  { code: 'PYG', name: 'Guaraní Paraguayo (PYG - Gs.)', symbol: 'Gs.', locale: 'es-PY', decimals: 0 },
  { code: 'COP', name: 'Peso Colombiano (COP - $)', symbol: '$', locale: 'es-CO', decimals: 0 },
  { code: 'MXN', name: 'Peso Mexicano (MXN - $)', symbol: '$', locale: 'es-MX', decimals: 2 },
  { code: 'PEN', name: 'Sol Peruano (PEN - S/)', symbol: 'S/', locale: 'es-PE', decimals: 2 },
];
