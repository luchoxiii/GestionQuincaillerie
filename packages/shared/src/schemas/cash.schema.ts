import { z } from 'zod';
import { CashMovementType } from '../types/enums';

export const OpenCashInputSchema = z.object({
  registerId: z.string().uuid(),
  openingBalance: z.number().min(0),
  notes: z.string().optional()
});

export const CloseCashInputSchema = z.object({
  closingBalance: z.number().min(0),
  notes: z.string().optional()
});

export const CashMovementInputSchema = z.object({
  type: z.nativeEnum(CashMovementType),
  amount: z.number().positive(), // Backend can make it negative depending on type
  methodId: z.string().uuid().optional(),
  description: z.string().min(1),
  referenceId: z.string().optional()
});

export type OpenCashInput = z.infer<typeof OpenCashInputSchema>;
export type CloseCashInput = z.infer<typeof CloseCashInputSchema>;
export type CashMovementInput = z.infer<typeof CashMovementInputSchema>;
