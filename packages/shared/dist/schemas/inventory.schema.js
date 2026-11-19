"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateInventoryCountInputSchema = exports.StockTransferInputSchema = exports.StockTransferItemInputSchema = exports.StockAdjustmentInputSchema = void 0;
const zod_1 = require("zod");
exports.StockAdjustmentInputSchema = zod_1.z.object({
    warehouseId: zod_1.z.string().uuid(),
    productId: zod_1.z.string().uuid(),
    quantity: zod_1.z.number(), // can be positive or negative
    notes: zod_1.z.string().optional()
});
exports.StockTransferItemInputSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid(),
    quantity: zod_1.z.number().positive()
});
exports.StockTransferInputSchema = zod_1.z.object({
    sourceId: zod_1.z.string().uuid(),
    destinationId: zod_1.z.string().uuid(),
    items: zod_1.z.array(exports.StockTransferItemInputSchema).min(1),
    notes: zod_1.z.string().optional()
});
exports.CreateInventoryCountInputSchema = zod_1.z.object({
    warehouseId: zod_1.z.string().uuid(),
    notes: zod_1.z.string().optional(),
    items: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string().uuid(),
        countedQty: zod_1.z.number().min(0)
    })).min(1)
});
