import { z } from 'zod';

export const InvoiceItemInputSchema = z.object({
  productId: z.string().uuid(),
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
  discount: z.number().min(0).default(0),
  taxRate: z.number().min(0)
});

export const CreateInvoiceInputSchema = z.object({
  saleId: z.string().uuid().optional(),
  customerId: z.string().uuid(),
  salePointId: z.string().uuid(),
  invoiceTypeId: z.string().uuid(),
  items: z.array(InvoiceItemInputSchema).min(1)
});

export type InvoiceItemInput = z.infer<typeof InvoiceItemInputSchema>;
export type CreateInvoiceInput = z.infer<typeof CreateInvoiceInputSchema>;
