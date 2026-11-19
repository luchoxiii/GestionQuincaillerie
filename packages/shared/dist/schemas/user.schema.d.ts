import { z } from 'zod';
export declare const CreateUserInputSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    roleIds: z.ZodArray<z.ZodString, "many">;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    roleIds: string[];
    isActive?: boolean | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    roleIds: string[];
    isActive?: boolean | undefined;
}>;
export declare const UpdateUserInputSchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    roleIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    password?: string | undefined;
    isActive?: boolean | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    roleIds?: string[] | undefined;
}, {
    email?: string | undefined;
    password?: string | undefined;
    isActive?: boolean | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    roleIds?: string[] | undefined;
}>;
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;
