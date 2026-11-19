"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnSaleInputSchema = exports.VoidSaleInputSchema = exports.CreateSaleInputSchema = exports.SalePaymentInputSchema = exports.SaleItemInputSchema = void 0;
const zod_1 = require("zod");
exports.SaleItemInputSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid(),
    quantity: zod_1.z.number().positive(),
    unitPrice: zod_1.z.number().min(0),
    discount: zod_1.z.number().min(0).default(0),
    taxRate: zod_1.z.number().min(0),
});
exports.SalePaymentInputSchema = zod_1.z.object({
    methodId: zod_1.z.string().uuid(),
    amount: zod_1.z.number().positive(),
    reference: zod_1.z.string().optional()
});
exports.CreateSaleInputSchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid().optional(),
    notes: zod_1.z.string().optional(),
    items: zod_1.z.array(exports.SaleItemInputSchema).min(1),
    payments: zod_1.z.array(exports.SalePaymentInputSchema).min(1),
    discount: zod_1.z.number().min(0).default(0)
});
exports.VoidSaleInputSchema = zod_1.z.object({
    reason: zod_1.z.string().optional()
});
exports.ReturnSaleInputSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        saleItemId: zod_1.z.string().uuid(),
        quantity: zod_1.z.number().positive()
    })).min(1),
    reason: zod_1.z.string().optional()
});
