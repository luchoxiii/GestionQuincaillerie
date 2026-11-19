import { z } from 'zod';
export declare const InvoiceItemInputSchema: z.ZodObject<{
    productId: z.ZodString;
    description: z.ZodString;
    quantity: z.ZodNumber;
    unitPrice: z.ZodNumber;
    discount: z.ZodDefault<z.ZodNumber>;
    taxRate: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    description: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
}, {
    description: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    discount?: number | undefined;
}>;
export declare const CreateInvoiceInputSchema: z.ZodObject<{
    saleId: z.ZodOptional<z.ZodString>;
    customerId: z.ZodString;
    salePointId: z.ZodString;
    invoiceTypeId: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        description: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
        discount: z.ZodDefault<z.ZodNumber>;
        taxRate: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        description: string;
        productId: string;
        quantity: number;
        unitPrice: number;
        discount: number;
        taxRate: number;
    }, {
        description: string;
        productId: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
        discount?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    customerId: string;
    items: {
        description: string;
        productId: string;
        quantity: number;
        unitPrice: number;
        discount: number;
        taxRate: number;
    }[];
    salePointId: string;
    invoiceTypeId: string;
    saleId?: string | undefined;
}, {
    customerId: string;
    items: {
        description: string;
        productId: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
        discount?: number | undefined;
    }[];
    salePointId: string;
    invoiceTypeId: string;
    saleId?: string | undefined;
}>;
export type InvoiceItemInput = z.infer<typeof InvoiceItemInputSchema>;
export type CreateInvoiceInput = z.infer<typeof CreateInvoiceInputSchema>;
