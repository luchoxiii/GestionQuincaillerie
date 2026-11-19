"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateInvoiceInputSchema = exports.InvoiceItemInputSchema = void 0;
const zod_1 = require("zod");
exports.InvoiceItemInputSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid(),
    description: zod_1.z.string().min(1),
    quantity: zod_1.z.number().positive(),
    unitPrice: zod_1.z.number().min(0),
    discount: zod_1.z.number().min(0).default(0),
    taxRate: zod_1.z.number().min(0)
});
exports.CreateInvoiceInputSchema = zod_1.z.object({
    saleId: zod_1.z.string().uuid().optional(),
    customerId: zod_1.z.string().uuid(),
    salePointId: zod_1.z.string().uuid(),
    invoiceTypeId: zod_1.z.string().uuid(),
    items: zod_1.z.array(exports.InvoiceItemInputSchema).min(1)
});
