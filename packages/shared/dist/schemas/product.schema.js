"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MassPriceUpdateInputSchema = exports.ProductFilterInputSchema = exports.UpdateProductInputSchema = exports.CreateProductInputSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../types/enums");
exports.CreateProductInputSchema = zod_1.z.object({
    code: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    categoryId: zod_1.z.string().uuid().optional(),
    brandId: zod_1.z.string().uuid().optional(),
    unitId: zod_1.z.string().uuid().optional(),
    isActive: zod_1.z.boolean().optional(),
    costPrice: zod_1.z.number().min(0),
    profitMargin: zod_1.z.number().min(0).optional(),
    salePrice: zod_1.z.number().min(0),
    minStock: zod_1.z.number().min(0).optional(),
    maxStock: zod_1.z.number().min(0).optional(),
    barcodes: zod_1.z.array(zod_1.z.object({
        barcode: zod_1.z.string(),
        type: zod_1.z.nativeEnum(enums_1.BarcodeType)
    })).optional()
});
exports.UpdateProductInputSchema = exports.CreateProductInputSchema.partial();
exports.ProductFilterInputSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    categoryId: zod_1.z.string().uuid().optional(),
    brandId: zod_1.z.string().uuid().optional(),
    isActive: zod_1.z.boolean().optional(),
    page: zod_1.z.number().int().min(1).optional(),
    limit: zod_1.z.number().int().min(1).optional()
});
exports.MassPriceUpdateInputSchema = zod_1.z.object({
    categoryIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    brandIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    productIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    percentage: zod_1.z.number(),
    roundTo: zod_1.z.number().optional()
});
