import { z } from 'zod';

export const CreateCategoryInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().uuid().optional()
});

export const UpdateCategoryInputSchema = CreateCategoryInputSchema.partial();

export type CreateCategoryInput = z.infer<typeof CreateCategoryInputSchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategoryInputSchema>;
