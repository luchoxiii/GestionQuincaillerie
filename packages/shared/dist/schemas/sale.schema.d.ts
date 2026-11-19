import { z } from 'zod';
export declare const SaleItemInputSchema: z.ZodObject<{
    productId: z.ZodString;
    quantity: z.ZodNumber;
    unitPrice: z.ZodNumber;
    discount: z.ZodDefault<z.ZodNumber>;
    taxRate: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    productId: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
}, {
    productId: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    discount?: number | undefined;
}>;
export declare const SalePaymentInputSchema: z.ZodObject<{
    methodId: z.ZodString;
    amount: z.ZodNumber;
    reference: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    methodId: string;
    amount: number;
    reference?: string | undefined;
}, {
    methodId: string;
    amount: number;
    reference?: string | undefined;
}>;
export declare const CreateSaleInputSchema: z.ZodObject<{
    customerId: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
        discount: z.ZodDefault<z.ZodNumber>;
        taxRate: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        productId: string;
        quantity: number;
        unitPrice: number;
        discount: number;
        taxRate: number;
    }, {
        productId: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
        discount?: number | undefined;
    }>, "many">;
    payments: z.ZodArray<z.ZodObject<{
        methodId: z.ZodString;
        amount: z.ZodNumber;
        reference: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        methodId: string;
        amount: number;
        reference?: string | undefined;
    }, {
        methodId: string;
        amount: number;
        reference?: string | undefined;
    }>, "many">;
    discount: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    discount: number;
    items: {
        productId: string;
        quantity: number;
        unitPrice: number;
        discount: number;
        taxRate: number;
    }[];
    payments: {
        methodId: string;
        amount: number;
        reference?: string | undefined;
    }[];
    customerId?: string | undefined;
    notes?: string | undefined;
}, {
    items: {
        productId: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
        discount?: number | undefined;
    }[];
    payments: {
        methodId: string;
        amount: number;
        reference?: string | undefined;
    }[];
    discount?: number | undefined;
    customerId?: string | undefined;
    notes?: string | undefined;
}>;
export declare const VoidSaleInputSchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason?: string | undefined;
}, {
    reason?: string | undefined;
}>;
export declare const ReturnSaleInputSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        saleItemId: z.ZodString;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        quantity: number;
        saleItemId: string;
    }, {
        quantity: number;
        saleItemId: string;
    }>, "many">;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    items: {
        quantity: number;
        saleItemId: string;
    }[];
    reason?: string | undefined;
}, {
    items: {
        quantity: number;
        saleItemId: string;
    }[];
    reason?: string | undefined;
}>;
export type SaleItemInput = z.infer<typeof SaleItemInputSchema>;
export type SalePaymentInput = z.infer<typeof SalePaymentInputSchema>;
export type CreateSaleInput = z.infer<typeof CreateSaleInputSchema>;
export type VoidSaleInput = z.infer<typeof VoidSaleInputSchema>;
export type ReturnSaleInput = z.infer<typeof ReturnSaleInputSchema>;
