import { z } from 'zod';

export const SaleItemInputSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
  discount: z.number().min(0).default(0),
  taxRate: z.number().min(0),
});

export const SalePaymentInputSchema = z.object({
  methodId: z.string().uuid(),
  amount: z.number().positive(),
  reference: z.string().optional()
});

export const CreateSaleInputSchema = z.object({
  customerId: z.string().uuid().optional(),
  notes: z.string().optional(),
  items: z.array(SaleItemInputSchema).min(1),
  payments: z.array(SalePaymentInputSchema).min(1),
  discount: z.number().min(0).default(0)
});

export const VoidSaleInputSchema = z.object({
  reason: z.string().optional()
});

export const ReturnSaleInputSchema = z.object({
  items: z.array(z.object({
    saleItemId: z.string().uuid(),
    quantity: z.number().positive()
  })).min(1),
  reason: z.string().optional()
});

export type SaleItemInput = z.infer<typeof SaleItemInputSchema>;
export type SalePaymentInput = z.infer<typeof SalePaymentInputSchema>;
export type CreateSaleInput = z.infer<typeof CreateSaleInputSchema>;
export type VoidSaleInput = z.infer<typeof VoidSaleInputSchema>;
export type ReturnSaleInput = z.infer<typeof ReturnSaleInputSchema>;
