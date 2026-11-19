"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePurchaseOrderInputSchema = exports.CreatePurchaseInputSchema = exports.PurchaseItemInputSchema = void 0;
const zod_1 = require("zod");
exports.PurchaseItemInputSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid(),
    quantity: zod_1.z.number().positive(),
    unitPrice: zod_1.z.number().min(0),
    taxRate: zod_1.z.number().min(0)
});
exports.CreatePurchaseInputSchema = zod_1.z.object({
    supplierId: zod_1.z.string().uuid(),
    purchaseOrderId: zod_1.z.string().uuid().optional(),
    invoiceNum: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    items: zod_1.z.array(exports.PurchaseItemInputSchema).min(1)
});
exports.CreatePurchaseOrderInputSchema = zod_1.z.object({
    supplierId: zod_1.z.string().uuid(),
    expectedDate: zod_1.z.string().datetime().optional(),
    notes: zod_1.z.string().optional(),
    items: zod_1.z.array(exports.PurchaseItemInputSchema).min(1)
});
