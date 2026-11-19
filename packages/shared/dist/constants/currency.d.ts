export interface CurrencyConfig {
    code: string;
    name: string;
    symbol: string;
    locale: string;
    decimals: number;
}
export declare const DEFAULT_CURRENCY: CurrencyConfig;
export declare const AVAILABLE_CURRENCIES: CurrencyConfig[];
