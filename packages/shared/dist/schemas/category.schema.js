"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCategoryInputSchema = exports.CreateCategoryInputSchema = void 0;
const zod_1 = require("zod");
exports.CreateCategoryInputSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    parentId: zod_1.z.string().uuid().optional()
});
exports.UpdateCategoryInputSchema = exports.CreateCategoryInputSchema.partial();
