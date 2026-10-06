import { z } from 'zod';
import { DocumentType, TaxCondition } from '../types/enums';

export const CreateSupplierInputSchema = z.object({
  name: z.string().min(1),
  documentType: z.nativeEnum(DocumentType),
  documentNum: z.string().min(1),
  taxCondition: z.nativeEnum(TaxCondition),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  isActive: z.boolean().optional()
});

export const UpdateSupplierInputSchema = CreateSupplierInputSchema.partial();

export type CreateSupplierInput = z.infer<typeof CreateSupplierInputSchema>;
export type UpdateSupplierInput = z.infer<typeof UpdateSupplierInputSchema>;
