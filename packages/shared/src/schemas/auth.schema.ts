import { z } from 'zod';

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const ChangePasswordInputSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6)
});

export const RefreshTokenInputSchema = z.object({
  refreshToken: z.string().min(1)
});

export type LoginInput = z.infer<typeof LoginInputSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordInputSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenInputSchema>;
