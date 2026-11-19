"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserInputSchema = exports.CreateUserInputSchema = void 0;
const zod_1 = require("zod");
exports.CreateUserInputSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    roleIds: zod_1.z.array(zod_1.z.string().uuid()).min(1),
    isActive: zod_1.z.boolean().optional()
});
exports.UpdateUserInputSchema = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    password: zod_1.z.string().min(6).optional(),
    firstName: zod_1.z.string().min(1).optional(),
    lastName: zod_1.z.string().min(1).optional(),
    roleIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    isActive: zod_1.z.boolean().optional()
});
