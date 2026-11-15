import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .trim()
    .toLowerCase()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string({ message: 'Password is required' })
    .min(8, 'Password must be at least 8 characters long'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .trim()
    .toLowerCase()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string({ message: 'Password is required' })
    .min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string({ message: 'Refresh token is required' })
    .min(1, 'Refresh token is required'),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

export const logoutSchema = z.object({
  refreshToken: z
    .string({ message: 'Refresh token is required' })
    .min(1, 'Refresh token is required'),
});

export type LogoutInput = z.infer<typeof logoutSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .trim()
    .toLowerCase()
    .min(1, 'Email is required')
    .email('Invalid email address'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z
    .string({ message: 'Reset token is required' })
    .min(1, 'Reset token is required'),
  password: z
    .string({ message: 'Password is required' })
    .min(8, 'Password must be at least 8 characters long'),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
