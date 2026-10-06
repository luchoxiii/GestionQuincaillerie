/**
 * Pure TypeScript cryptographic SHA-256 implementation (FIPS 180-4 standard)
 * 100% portable: works in Node.js, browser, and web workers with zero external dependencies.
 */

function rightRotate(value: number, amount: number): number {
  return (value >>> amount) | (value << (32 - amount));
}

export function sha256(ascii: string): string {
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i = 0;
  let j = 0;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  // Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
  let hash: number[] = [];
  // Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
  const k: number[] = [];

  let primeCounter = 0;
  const isComposite: Record<number, number> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  hash = hash.slice(0, 8);

  ascii += '\x80'; // Append '1' bit
  while ((ascii[lengthProperty] % 64) - 56) ascii += '\x00'; // More zero bytes
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    words[i >> 2] |= j << ((3 - (i % 4)) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength | 0;

  // Process each 16-word chunk
  for (j = 0; j < words[lengthProperty]; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];

      const s0 = i >= 16 ? rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3) : 0;
      const s1 = i >= 16 ? rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10) : 0;

      if (i >= 16) {
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }

      const s0Hash = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const t2 = (s0Hash + maj) | 0;

      const s1Hash = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const t1 = (hash[7] + s1Hash + ch + k[i] + w[i]) | 0;

      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + t1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (t1 + t2) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }

  return result;
}

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export interface AuditBlockData {
  sequence: number;
  timestamp: string;
  userId?: string;
  username?: string;
  user?: string;
  role?: string;
  action: string;
  entity: string;
  entityId: string;
  description?: string;
  details?: any;
  ipAddress?: string;
  previousHash: string;
}

export type ChainableAuditEntry = AuditBlockData;

/**
 * Computes deterministic SHA-256 hash for an audit log entry
 */
export function computeAuditLogHash(data: AuditBlockData): string {
  // Normalize details into a sorted canonical string
  const detailsStr = data.details !== undefined && data.details !== null
    ? JSON.stringify(data.details, Object.keys(data.details).sort())
    : '';

  const payload = [
    String(data.sequence),
    String(data.timestamp),
    String(data.userId || ''),
    String(data.username || ''),
    String(data.action),
    String(data.entity),
    String(data.entityId),
    String(data.description || ''),
    detailsStr,
    String(data.ipAddress || ''),
    String(data.previousHash),
  ].join('|');

  return sha256(payload);
}

export interface VerificationResult {
  isValid: boolean;
  totalVerified: number;
  errorIndex?: number;
  errorMessage?: string;
  rootHash: string;
  verifiedAt: string;
}

/**
 * Validates a sequential chain of audit logs against tampering, alteration, or deletions
 * Expects logs ordered chronologically (sequence 1 to N)
 */
export function verifyAuditChain(logs: (AuditBlockData & { hash: string })[]): VerificationResult {
  const verifiedAt = new Date().toISOString();

  if (!logs || logs.length === 0) {
    return {
      isValid: true,
      totalVerified: 0,
      rootHash: GENESIS_HASH,
      verifiedAt,
    };
  }

  // Sort by sequence ascending to verify chain
  const sorted = [...logs].sort((a, b) => a.sequence - b.sequence);

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];

    // 1. Check sequence continuity
    if (i > 0 && current.sequence !== sorted[i - 1].sequence + 1) {
      return {
        isValid: false,
        totalVerified: i,
        errorIndex: i,
        errorMessage: `Discontinuidad en secuencia: Registro #${current.sequence} no sigue a #${sorted[i - 1].sequence}`,
        rootHash: sorted[i - 1]?.hash || GENESIS_HASH,
        verifiedAt,
      };
    }

    // 2. Check previousHash link
    const expectedPrev = i === 0 ? GENESIS_HASH : sorted[i - 1].hash;
    if (current.previousHash !== expectedPrev) {
      return {
        isValid: false,
        totalVerified: i,
        errorIndex: i,
        errorMessage: `Cadena rota en registro #${current.sequence}: hash previo '${current.previousHash?.substring(0, 8)}...' no coincide con '${expectedPrev?.substring(0, 8)}...'`,
        rootHash: expectedPrev,
        verifiedAt,
      };
    }

    // 3. Recompute and verify current hash
    const recomputed = computeAuditLogHash(current);
    if (current.hash !== recomputed) {
      return {
        isValid: false,
        totalVerified: i,
        errorIndex: i,
        errorMessage: `Registro #${current.sequence} fue alterado o adulterado: Hash registrado no coincide con el cálculo criptográfico`,
        rootHash: expectedPrev,
        verifiedAt,
      };
    }
  }

  return {
    isValid: true,
    totalVerified: sorted.length,
    rootHash: sorted[sorted.length - 1].hash,
    verifiedAt,
  };
}
