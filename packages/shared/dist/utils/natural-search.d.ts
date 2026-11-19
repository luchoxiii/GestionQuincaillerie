/**
 * Natural Language Search Engine for Ferretería ERP
 * Supports:
 * - Accent / diacritic insensitivity (á, é, í, ó, ú, ñ)
 * - Spanish stop-words removal ('de', 'del', 'para', 'con', 'en', etc.)
 * - Out-of-order multi-token matching (e.g., "50kg portland" -> "Cemento Portland 50kg")
 * - Singular / Plural stemming tolerance (e.g., "clavos" -> "clavo", "tornillos" -> "tornillo")
 * - Inverted person names (e.g., "perez juan" -> "Juan Pérez")
 * - Semantic intent filters:
 *   - Products: "sin stock" (stock = 0), "con stock", "bajo stock" (stock <= minStock), "< 10000", "> 50000"
 *   - Customers: "con deuda", "sin deuda", "vetado", "habilitado", "vip", "inscripto"
 *   - Users: "cajero", "vendedor", "admin", "encargado", "deposito", "activo", "inactivo"
 */
export declare const SPANISH_STOP_WORDS: Set<string>;
/**
 * Normalizes text: lowercases, removes diacritics/accents, trims whitespace
 */
export declare function normalizeText(text: string | null | undefined): string;
/**
 * Basic Spanish stemmer to normalize plurals to singular forms
 */
export declare function stemSpanishWord(word: string): string;
/**
 * Splits query into meaningful tokens, stripping stop words and providing stems
 */
export declare function extractSearchTokens(query: string): string[];
/**
 * Checks if a haystack string contains a needle (or its Spanish stem/gender variation)
 */
export declare function fieldMatchesToken(fieldValue: string | null | undefined, token: string): boolean;
export interface ProductMatchOptions {
    categoryName?: string;
    brandName?: string;
}
export declare function matchProductNatural(product: any, query: string, options?: ProductMatchOptions): boolean;
export declare function matchCustomerNatural(customer: any, query: string): boolean;
export declare function matchUserNatural(user: any, query: string): boolean;
