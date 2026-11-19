"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashMovementInputSchema = exports.CloseCashInputSchema = exports.OpenCashInputSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../types/enums");
exports.OpenCashInputSchema = zod_1.z.object({
    registerId: zod_1.z.string().uuid(),
    openingBalance: zod_1.z.number().min(0),
    notes: zod_1.z.string().optional()
});
exports.CloseCashInputSchema = zod_1.z.object({
    closingBalance: zod_1.z.number().min(0),
    notes: zod_1.z.string().optional()
});
exports.CashMovementInputSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(enums_1.CashMovementType),
    amount: zod_1.z.number().positive(), // Backend can make it negative depending on type
    methodId: zod_1.z.string().uuid().optional(),
    description: zod_1.z.string().min(1),
    referenceId: zod_1.z.string().optional()
});
