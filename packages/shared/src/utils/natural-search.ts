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

export const SPANISH_STOP_WORDS = new Set([
  'de', 'del', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'con', 'para', 'por', 'en', 'y', 'e', 'o', 'u', 'a', 'al', 'que',
  'su', 'sus', 'lo', 'le', 'les', 'se'
]);

/**
 * Normalizes text: lowercases, removes diacritics/accents, trims whitespace
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Basic Spanish stemmer to normalize plurals to singular forms
 */
export function stemSpanishWord(word: string): string {
  if (word.length <= 3) return word;

  // Words ending in "ces" -> "z" (e.g., nueces -> nuez, luces -> luz, peces -> pez)
  if (word.endsWith('ces') && word.length > 3) {
    return word.slice(0, -3) + 'z';
  }

  // Words ending in "es" preceded by consonant
  if (word.endsWith('es') && word.length > 4) {
    const root = word.slice(0, -2);
    // If root ends in consonant cluster like bl, br, cl, cr, dr, gr, pr, tr, nt, etc., singular ends in 'e' (cables -> cable)
    if (/[bcdfgpt][lr]$|[nst]t$|[aeiou]$/i.test(root)) {
      return root + 'e';
    }
    // If root ends in typical consonant ending like r (motor), l (papel), d (pared), z, n:
    if (/[rlndz]$/i.test(root)) {
      return root;
    }
    return root + 'e';
  }

  // Words ending in "s" preceded by vowel (e.g., clavos -> clavo, bolsas -> bolsa)
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) {
    return word.slice(0, -1);
  }

  return word;
}

/**
 * Splits query into meaningful tokens, stripping stop words and providing stems
 */
export function extractSearchTokens(query: string): string[] {
  const normalized = normalizeText(query);
  const words = normalized
    .replace(/[^a-z0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const tokens: string[] = [];
  for (const w of words) {
    if (!SPANISH_STOP_WORDS.has(w) && w.length > 1) {
      tokens.push(w);
    } else if (words.length === 1) {
      // If user typed only a single stop word (e.g. "de"), don't filter it out completely
      tokens.push(w);
    }
  }

  return tokens;
}

/**
 * Checks if a haystack string contains a needle (or its Spanish stem/gender variation)
 */
export function fieldMatchesToken(fieldValue: string | null | undefined, token: string): boolean {
  if (!fieldValue) return false;
  const normalizedField = normalizeText(fieldValue);
  const normalizedToken = normalizeText(token);

  if (normalizedField.includes(normalizedToken)) {
    return true;
  }

  const stem = stemSpanishWord(normalizedToken);
  if (stem.length > 2 && normalizedField.includes(stem)) {
    return true;
  }

  // Gender variation matching: e.g. electrico <-> electricas, pesado <-> pesada
  // Strip trailing -o, -a, -os, -as
  const genderRoot = normalizedToken.replace(/(?:[oa]s?|[oe]s?)$/i, '');
  if (genderRoot.length >= 4 && normalizedField.includes(genderRoot)) {
    return true;
  }

  return false;
}

// -------------------------------------------------------------
// 1. PRODUCT NATURAL LANGUAGE MATCHING
// -------------------------------------------------------------

export interface ProductMatchOptions {
  categoryName?: string;
  brandName?: string;
}

export function matchProductNatural(product: any, query: string, options?: ProductMatchOptions): boolean {
  if (!query || !query.trim()) return true;

  const rawNorm = normalizeText(query);

  // Price constraint extraction (e.g., "< 5000", "> 20000", "menos de 10000", "mas de 15000")
  const productPrice = Number(product.price ?? product.salePrice ?? 0);
  const lessThanMatch = rawNorm.match(/(?:<|menos de|hasta)\s*(\d+(?:\.\d+)?)/i);
  if (lessThanMatch) {
    const maxVal = parseFloat(lessThanMatch[1]);
    if (!isNaN(maxVal) && productPrice > maxVal) {
      return false;
    }
  }

  const greaterThanMatch = rawNorm.match(/(?:>|mas de|desde)\s*(\d+(?:\.\d+)?)/i);
  if (greaterThanMatch) {
    const minVal = parseFloat(greaterThanMatch[1]);
    if (!isNaN(minVal) && productPrice < minVal) {
      return false;
    }
  }

  // Stock semantic intents
  const stock = Number(product.totalStock ?? product.stock ?? 0);
  const minStock = Number(product.minStock ?? 5);

  const isZeroStockIntent = /(?:sin\s+stock|agotado|sin\s+existencia|stock\s*0|cero\s+stock)/i.test(rawNorm);
  if (isZeroStockIntent) {
    if (stock > 0) return false;
  }

  const isInStockIntent = /(?:con\s+stock|en\s+stock|disponible|hay\s+stock)/i.test(rawNorm);
  if (isInStockIntent) {
    if (stock <= 0) return false;
  }

  const isLowStockIntent = /(?:bajo\s+stock|poco\s+stock|reponer|critico|stock\s+bajo)/i.test(rawNorm);
  if (isLowStockIntent) {
    if (stock <= 0 || stock > minStock) return false;
  }

  // Remove the special phrases from query so they don't break keyword token matching
  let cleanQuery = rawNorm
    .replace(/(?:sin\s+stock|agotado|sin\s+existencia|stock\s*0|cero\s+stock)/gi, ' ')
    .replace(/(?:con\s+stock|en\s+stock|disponible|hay\s+stock)/gi, ' ')
    .replace(/(?:bajo\s+stock|poco\s+stock|reponer|critico|stock\s+bajo)/gi, ' ')
    .replace(/(?:<|menos de|hasta)\s*\d+(?:\.\d+)?/gi, ' ')
    .replace(/(?:>|mas de|desde)\s*\d+(?:\.\d+)?/gi, ' ')
    .trim();

  const tokens = extractSearchTokens(cleanQuery);
  if (tokens.length === 0) {
    // If query only contained semantic filters (e.g. "sin stock"), and it matched the criteria above:
    return true;
  }

  // Collect all searchable text fields for this product
  const categoryStr = options?.categoryName || product.category?.name || product.categoryName || '';
  const brandStr = options?.brandName || product.brand?.name || product.brandName || '';
  const barcodesStr = Array.isArray(product.barcodes)
    ? product.barcodes.map((b: any) => (typeof b === 'string' ? b : b.barcode)).join(' ')
    : '';

  const searchablePool = [
    product.name,
    product.sku,
    product.code,
    product.description,
    categoryStr,
    brandStr,
    barcodesStr,
  ];

  // Every token must match in AT LEAST ONE searchable field
  return tokens.every((token) => {
    return searchablePool.some((field) => fieldMatchesToken(field, token));
  });
}

// -------------------------------------------------------------
// 2. CUSTOMER NATURAL LANGUAGE MATCHING
// -------------------------------------------------------------

export function matchCustomerNatural(customer: any, query: string): boolean {
  if (!query || !query.trim()) return true;

  const rawNorm = normalizeText(query);
  const balance = Number(customer.balance ?? customer.currentBalance ?? 0);
  const creditLimit = Number(customer.creditLimit ?? 0);
  const isBanned = Boolean(customer.isBanned);

  // Semantic intents for debtors and balances
  const isDebtorIntent = /(?:con\s+deuda|deudores|deudor|moroso|morosos|debe|saldo\s+pendiente)/i.test(rawNorm);
  if (isDebtorIntent) {
    if (balance <= 0) return false;
  }

  const isNoDebtIntent = /(?:sin\s+deuda|al\s+dia|saldo\s+cero)/i.test(rawNorm);
  if (isNoDebtIntent) {
    if (balance > 0) return false;
  }

  // Semantic intents for banned customers
  const isBannedIntent = /(?:vetado|vetados|bloqueado|bloqueados|inhabilitado)/i.test(rawNorm);
  if (isBannedIntent) {
    if (!isBanned) return false;
  }

  const isAllowedIntent = /(?:habilitado|activo|no\s+vetado)/i.test(rawNorm);
  if (isAllowedIntent) {
    if (isBanned) return false;
  }

  // Semantic intents for credit limit exceeded
  const isExceededIntent = /(?:excedido|limite\s+superado|sin\s+credito)/i.test(rawNorm);
  if (isExceededIntent) {
    if (creditLimit <= 0 || balance <= creditLimit) return false;
  }

  // Clean intent phrases from query
  const cleanQuery = rawNorm
    .replace(/(?:con\s+deuda|deudores|deudor|moroso|morosos|debe|saldo\s+pendiente)/gi, ' ')
    .replace(/(?:sin\s+deuda|al\s+dia|saldo\s+cero)/gi, ' ')
    .replace(/(?:vetado|vetados|bloqueado|bloqueados|inhabilitado)/gi, ' ')
    .replace(/(?:habilitado|activo|no\s+vetado)/gi, ' ')
    .replace(/(?:excedido|limite\s+superado|sin\s+credito)/gi, ' ')
    .trim();

  const tokens = extractSearchTokens(cleanQuery);
  if (tokens.length === 0) {
    return true;
  }

  const doc = customer.documentNum || customer.documentNumber || '';
  const searchablePool = [
    customer.name,
    customer.businessName,
    doc,
    customer.phone,
    customer.email,
    customer.address,
    customer.taxCondition,
    customer.segment,
  ];

  return tokens.every((token) => {
    return searchablePool.some((field) => fieldMatchesToken(field, token));
  });
}

// -------------------------------------------------------------
// 3. USER NATURAL LANGUAGE MATCHING
// -------------------------------------------------------------

export function matchUserNatural(user: any, query: string): boolean {
  if (!query || !query.trim()) return true;

  const rawNorm = normalizeText(query);
  const isActive = user.isActive !== false;

  // Active / Inactive status intent
  const isActiveIntent = /(?:activo|activos|habilitado)/i.test(rawNorm) && !/(?:inactivo|deshabilitado)/i.test(rawNorm);
  if (isActiveIntent) {
    if (!isActive) return false;
  }

  const isInactiveIntent = /(?:inactivo|inactivos|deshabilitado|bloqueado|baja)/i.test(rawNorm);
  if (isInactiveIntent) {
    if (isActive) return false;
  }

  // Extract roles string for search
  const roleNames = Array.isArray(user.userRoles)
    ? user.userRoles.map((ur: any) => ur.role?.name || ur.roleId || '').join(' ')
    : (user.role || '');

  // Role keyword aliases
  const isCajeroIntent = /(?:cajero|cajeros|vendedor|vendedores)/i.test(rawNorm);
  const isAdminIntent = /(?:admin|administrador|administradores)/i.test(rawNorm);
  const isEncargadoIntent = /(?:encargado|encargados|supervisor)/i.test(rawNorm);
  const isDepositoIntent = /(?:deposito|almacen|bodega)/i.test(rawNorm);

  if (isCajeroIntent) {
    const hasRole = /vendedor|cajero/i.test(roleNames) || /cajero/i.test(user.username);
    if (!hasRole && !user.userRoles?.some((ur: any) => ur.roleId === 'r-vendedor')) {
      return false;
    }
  }

  if (isAdminIntent) {
    const hasRole = /admin/i.test(roleNames) || /admin/i.test(user.username);
    if (!hasRole && !user.userRoles?.some((ur: any) => ur.roleId === 'r-admin')) {
      return false;
    }
  }

  if (isEncargadoIntent) {
    const hasRole = /encargado|supervisor/i.test(roleNames);
    if (!hasRole && !user.userRoles?.some((ur: any) => ur.roleId === 'r-encargado')) {
      return false;
    }
  }

  if (isDepositoIntent) {
    const hasRole = /deposito|almacen/i.test(roleNames) || /deposito/i.test(user.username);
    if (!hasRole && !user.userRoles?.some((ur: any) => ur.roleId === 'r-deposito')) {
      return false;
    }
  }

  // Clean intents
  const cleanQuery = rawNorm
    .replace(/(?:activo|activos|habilitado|inactivo|inactivos|deshabilitado|bloqueado|baja)/gi, ' ')
    .replace(/(?:cajero|cajeros|vendedor|vendedores)/gi, ' ')
    .replace(/(?:admin|administrador|administradores)/gi, ' ')
    .replace(/(?:encargado|encargados|supervisor)/gi, ' ')
    .replace(/(?:deposito|almacen|bodega)/gi, ' ')
    .trim();

  const tokens = extractSearchTokens(cleanQuery);
  if (tokens.length === 0) {
    return true;
  }

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  const searchablePool = [
    user.username,
    user.firstName,
    user.lastName,
    fullName,
    user.email,
    roleNames,
  ];

  return tokens.every((token) => {
    return searchablePool.some((field) => fieldMatchesToken(field, token));
  });
}
