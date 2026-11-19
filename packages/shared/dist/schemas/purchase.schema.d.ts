import { z } from 'zod';
export declare const PurchaseItemInputSchema: z.ZodObject<{
    productId: z.ZodString;
    quantity: z.ZodNumber;
    unitPrice: z.ZodNumber;
    taxRate: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    productId: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
}, {
    productId: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
}>;
export declare const CreatePurchaseInputSchema: z.ZodObject<{
    supplierId: z.ZodString;
    purchaseOrderId: z.ZodOptional<z.ZodString>;
    invoiceNum: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
        taxRate: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        productId: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
    }, {
        productId: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        productId: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
    }[];
    supplierId: string;
    notes?: string | undefined;
    purchaseOrderId?: string | undefined;
    invoiceNum?: string | undefined;
}, {
    items: {
        productId: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
    }[];
    supplierId: string;
    notes?: string | undefined;
    purchaseOrderId?: string | undefined;
    invoiceNum?: string | undefined;
}>;
export declare const CreatePurchaseOrderInputSchema: z.ZodObject<{
    supplierId: z.ZodString;
    expectedDate: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
        taxRate: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        productId: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
    }, {
        productId: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        productId: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
    }[];
    supplierId: string;
    notes?: string | undefined;
    expectedDate?: string | undefined;
}, {
    items: {
        productId: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
    }[];
    supplierId: string;
    notes?: string | undefined;
    expectedDate?: string | undefined;
}>;
export type PurchaseItemInput = z.infer<typeof PurchaseItemInputSchema>;
export type CreatePurchaseInput = z.infer<typeof CreatePurchaseInputSchema>;
export type CreatePurchaseOrderInput = z.infer<typeof CreatePurchaseOrderInputSchema>;
