"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSupplierInputSchema = exports.CreateSupplierInputSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../types/enums");
exports.CreateSupplierInputSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    documentType: zod_1.z.nativeEnum(enums_1.DocumentType),
    documentNum: zod_1.z.string().min(1),
    taxCondition: zod_1.z.nativeEnum(enums_1.TaxCondition),
    email: zod_1.z.string().email().optional().or(zod_1.z.literal('')),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    zipCode: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional()
});
exports.UpdateSupplierInputSchema = exports.CreateSupplierInputSchema.partial();
