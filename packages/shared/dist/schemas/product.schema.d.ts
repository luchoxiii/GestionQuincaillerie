import { z } from 'zod';
import { BarcodeType } from '../types/enums';
export declare const CreateProductInputSchema: z.ZodObject<{
    code: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodString>;
    brandId: z.ZodOptional<z.ZodString>;
    unitId: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    costPrice: z.ZodNumber;
    profitMargin: z.ZodOptional<z.ZodNumber>;
    salePrice: z.ZodNumber;
    minStock: z.ZodOptional<z.ZodNumber>;
    maxStock: z.ZodOptional<z.ZodNumber>;
    barcodes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        barcode: z.ZodString;
        type: z.ZodNativeEnum<typeof BarcodeType>;
    }, "strip", z.ZodTypeAny, {
        type: BarcodeType;
        barcode: string;
    }, {
        type: BarcodeType;
        barcode: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    code: string;
    name: string;
    costPrice: number;
    salePrice: number;
    description?: string | undefined;
    categoryId?: string | undefined;
    brandId?: string | undefined;
    unitId?: string | undefined;
    isActive?: boolean | undefined;
    profitMargin?: number | undefined;
    minStock?: number | undefined;
    maxStock?: number | undefined;
    barcodes?: {
        type: BarcodeType;
        barcode: string;
    }[] | undefined;
}, {
    code: string;
    name: string;
    costPrice: number;
    salePrice: number;
    description?: string | undefined;
    categoryId?: string | undefined;
    brandId?: string | undefined;
    unitId?: string | undefined;
    isActive?: boolean | undefined;
    profitMargin?: number | undefined;
    minStock?: number | undefined;
    maxStock?: number | undefined;
    barcodes?: {
        type: BarcodeType;
        barcode: string;
    }[] | undefined;
}>;
export declare const UpdateProductInputSchema: z.ZodObject<{
    code: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    categoryId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    brandId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    unitId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    costPrice: z.ZodOptional<z.ZodNumber>;
    profitMargin: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    salePrice: z.ZodOptional<z.ZodNumber>;
    minStock: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    maxStock: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    barcodes: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        barcode: z.ZodString;
        type: z.ZodNativeEnum<typeof BarcodeType>;
    }, "strip", z.ZodTypeAny, {
        type: BarcodeType;
        barcode: string;
    }, {
        type: BarcodeType;
        barcode: string;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    code?: string | undefined;
    name?: string | undefined;
    description?: string | undefined;
    categoryId?: string | undefined;
    brandId?: string | undefined;
    unitId?: string | undefined;
    isActive?: boolean | undefined;
    costPrice?: number | undefined;
    profitMargin?: number | undefined;
    salePrice?: number | undefined;
    minStock?: number | undefined;
    maxStock?: number | undefined;
    barcodes?: {
        type: BarcodeType;
        barcode: string;
    }[] | undefined;
}, {
    code?: string | undefined;
    name?: string | undefined;
    description?: string | undefined;
    categoryId?: string | undefined;
    brandId?: string | undefined;
    unitId?: string | undefined;
    isActive?: boolean | undefined;
    costPrice?: number | undefined;
    profitMargin?: number | undefined;
    salePrice?: number | undefined;
    minStock?: number | undefined;
    maxStock?: number | undefined;
    barcodes?: {
        type: BarcodeType;
        barcode: string;
    }[] | undefined;
}>;
export declare const ProductFilterInputSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodString>;
    brandId: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    categoryId?: string | undefined;
    brandId?: string | undefined;
    isActive?: boolean | undefined;
    search?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}, {
    categoryId?: string | undefined;
    brandId?: string | undefined;
    isActive?: boolean | undefined;
    search?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export declare const MassPriceUpdateInputSchema: z.ZodObject<{
    categoryIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    brandIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    productIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    percentage: z.ZodNumber;
    roundTo: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    percentage: number;
    categoryIds?: string[] | undefined;
    brandIds?: string[] | undefined;
    productIds?: string[] | undefined;
    roundTo?: number | undefined;
}, {
    percentage: number;
    categoryIds?: string[] | undefined;
    brandIds?: string[] | undefined;
    productIds?: string[] | undefined;
    roundTo?: number | undefined;
}>;
export type CreateProductInput = z.infer<typeof CreateProductInputSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductInputSchema>;
export type ProductFilterInput = z.infer<typeof ProductFilterInputSchema>;
export type MassPriceUpdateInput = z.infer<typeof MassPriceUpdateInputSchema>;
