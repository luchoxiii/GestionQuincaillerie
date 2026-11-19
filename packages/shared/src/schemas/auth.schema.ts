import { z } from 'zod';

export const LoginInputSchema = z.object({
  username: z.string().min(1).max(100).optional(),
  email: z.string().email().max(100).optional(),
  password: z.string().min(6).max(128)
});

export const ChangePasswordInputSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(128)
});

export const RefreshTokenInputSchema = z.object({
  refreshToken: z.string().min(1)
});

export type LoginInput = z.infer<typeof LoginInputSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordInputSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenInputSchema>;
