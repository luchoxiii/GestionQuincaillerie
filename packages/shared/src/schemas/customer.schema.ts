import { z } from 'zod';
import { DocumentType, TaxCondition } from '../types/enums';

export const CreateCustomerInputSchema = z.object({
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
  priceListId: z.string().uuid().optional(),
  creditLimit: z.number().optional(),
  isActive: z.boolean().optional(),
  isBanned: z.boolean().optional(),
  banReason: z.string().optional()
});

export const UpdateCustomerInputSchema = CreateCustomerInputSchema.partial();

export type CreateCustomerInput = z.infer<typeof CreateCustomerInputSchema>;
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerInputSchema>;
