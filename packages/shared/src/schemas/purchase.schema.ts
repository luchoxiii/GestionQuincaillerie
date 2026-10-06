import { z } from 'zod';

export const PurchaseItemInputSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
  taxRate: z.number().min(0)
});

export const CreatePurchaseInputSchema = z.object({
  supplierId: z.string().uuid(),
  purchaseOrderId: z.string().uuid().optional(),
  invoiceNum: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(PurchaseItemInputSchema).min(1)
});

export const CreatePurchaseOrderInputSchema = z.object({
  supplierId: z.string().uuid(),
  expectedDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  items: z.array(PurchaseItemInputSchema).min(1)
});

export type PurchaseItemInput = z.infer<typeof PurchaseItemInputSchema>;
export type CreatePurchaseInput = z.infer<typeof CreatePurchaseInputSchema>;
export type CreatePurchaseOrderInput = z.infer<typeof CreatePurchaseOrderInputSchema>;
