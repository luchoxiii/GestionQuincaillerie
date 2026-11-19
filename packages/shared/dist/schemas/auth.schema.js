"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenInputSchema = exports.ChangePasswordInputSchema = exports.LoginInputSchema = void 0;
const zod_1 = require("zod");
exports.LoginInputSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6)
});
exports.ChangePasswordInputSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(6)
});
exports.RefreshTokenInputSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1)
});
