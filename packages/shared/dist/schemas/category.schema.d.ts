import { z } from 'zod';
export declare const CreateCategoryInputSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    parentId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description?: string | undefined;
    parentId?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
    parentId?: string | undefined;
}>;
export declare const UpdateCategoryInputSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    parentId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    parentId?: string | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    parentId?: string | undefined;
}>;
export type CreateCategoryInput = z.infer<typeof CreateCategoryInputSchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategoryInputSchema>;
