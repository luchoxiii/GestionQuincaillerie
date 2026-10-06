import { z } from 'zod';
import { BarcodeType } from '../types/enums';

export const CreateProductInputSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  unitId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  costPrice: z.number().min(0),
  profitMargin: z.number().min(0).optional(),
  salePrice: z.number().min(0),
  minStock: z.number().min(0).optional(),
  maxStock: z.number().min(0).optional(),
  barcodes: z.array(z.object({
    barcode: z.string(),
    type: z.nativeEnum(BarcodeType)
  })).optional()
});

export const UpdateProductInputSchema = CreateProductInputSchema.partial();

export const ProductFilterInputSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional()
});

export const MassPriceUpdateInputSchema = z.object({
  categoryIds: z.array(z.string().uuid()).optional(),
  brandIds: z.array(z.string().uuid()).optional(),
  productIds: z.array(z.string().uuid()).optional(),
  percentage: z.number(),
  roundTo: z.number().optional()
});

export type CreateProductInput = z.infer<typeof CreateProductInputSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductInputSchema>;
export type ProductFilterInput = z.infer<typeof ProductFilterInputSchema>;
export type MassPriceUpdateInput = z.infer<typeof MassPriceUpdateInputSchema>;
