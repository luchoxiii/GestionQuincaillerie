/**
 * Pure TypeScript cryptographic SHA-256 implementation (FIPS 180-4 standard)
 * 100% portable: works in Node.js, browser, and web workers with zero external dependencies.
 */
export declare function sha256(ascii: string): string;
export declare const GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";
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
export declare function computeAuditLogHash(data: AuditBlockData): string;
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
export declare function verifyAuditChain(logs: (AuditBlockData & {
    hash: string;
})[]): VerificationResult;
