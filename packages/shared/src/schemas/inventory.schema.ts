import { z } from 'zod';

export const StockAdjustmentInputSchema = z.object({
  warehouseId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number(), // can be positive or negative
  notes: z.string().optional()
});

export const StockTransferItemInputSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive()
});

export const StockTransferInputSchema = z.object({
  sourceId: z.string().uuid(),
  destinationId: z.string().uuid(),
  items: z.array(StockTransferItemInputSchema).min(1),
  notes: z.string().optional()
});

export const CreateInventoryCountInputSchema = z.object({
  warehouseId: z.string().uuid(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    countedQty: z.number().min(0)
  })).min(1)
});

export type StockAdjustmentInput = z.infer<typeof StockAdjustmentInputSchema>;
export type StockTransferInput = z.infer<typeof StockTransferInputSchema>;
export type CreateInventoryCountInput = z.infer<typeof CreateInventoryCountInputSchema>;
