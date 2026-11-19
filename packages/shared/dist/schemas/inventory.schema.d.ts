import { z } from 'zod';
export declare const StockAdjustmentInputSchema: z.ZodObject<{
    warehouseId: z.ZodString;
    productId: z.ZodString;
    quantity: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    productId: string;
    quantity: number;
    warehouseId: string;
    notes?: string | undefined;
}, {
    productId: string;
    quantity: number;
    warehouseId: string;
    notes?: string | undefined;
}>;
export declare const StockTransferItemInputSchema: z.ZodObject<{
    productId: z.ZodString;
    quantity: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    productId: string;
    quantity: number;
}, {
    productId: string;
    quantity: number;
}>;
export declare const StockTransferInputSchema: z.ZodObject<{
    sourceId: z.ZodString;
    destinationId: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        productId: string;
        quantity: number;
    }, {
        productId: string;
        quantity: number;
    }>, "many">;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    items: {
        productId: string;
        quantity: number;
    }[];
    sourceId: string;
    destinationId: string;
    notes?: string | undefined;
}, {
    items: {
        productId: string;
        quantity: number;
    }[];
    sourceId: string;
    destinationId: string;
    notes?: string | undefined;
}>;
export declare const CreateInventoryCountInputSchema: z.ZodObject<{
    warehouseId: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        countedQty: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        productId: string;
        countedQty: number;
    }, {
        productId: string;
        countedQty: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        productId: string;
        countedQty: number;
    }[];
    warehouseId: string;
    notes?: string | undefined;
}, {
    items: {
        productId: string;
        countedQty: number;
    }[];
    warehouseId: string;
    notes?: string | undefined;
}>;
export type StockAdjustmentInput = z.infer<typeof StockAdjustmentInputSchema>;
export type StockTransferInput = z.infer<typeof StockTransferInputSchema>;
export type CreateInventoryCountInput = z.infer<typeof CreateInventoryCountInputSchema>;
