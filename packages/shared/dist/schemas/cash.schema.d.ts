import { z } from 'zod';
import { CashMovementType } from '../types/enums';
export declare const OpenCashInputSchema: z.ZodObject<{
    registerId: z.ZodString;
    openingBalance: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    registerId: string;
    openingBalance: number;
    notes?: string | undefined;
}, {
    registerId: string;
    openingBalance: number;
    notes?: string | undefined;
}>;
export declare const CloseCashInputSchema: z.ZodObject<{
    closingBalance: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    closingBalance: number;
    notes?: string | undefined;
}, {
    closingBalance: number;
    notes?: string | undefined;
}>;
export declare const CashMovementInputSchema: z.ZodObject<{
    type: z.ZodNativeEnum<typeof CashMovementType>;
    amount: z.ZodNumber;
    methodId: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
    referenceId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: CashMovementType;
    description: string;
    amount: number;
    methodId?: string | undefined;
    referenceId?: string | undefined;
}, {
    type: CashMovementType;
    description: string;
    amount: number;
    methodId?: string | undefined;
    referenceId?: string | undefined;
}>;
export type OpenCashInput = z.infer<typeof OpenCashInputSchema>;
export type CloseCashInput = z.infer<typeof CloseCashInputSchema>;
export type CashMovementInput = z.infer<typeof CashMovementInputSchema>;
