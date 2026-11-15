import type { NextFunction, Request, Response } from 'express';
import { env } from '../../config/env.js';
import { successResponse } from '../../utils/apiResponse.js';
import { AppError } from '../../utils/appError.js';
import type {
  ForgotPasswordInput,
  LoginInput,
  LogoutInput,
  RefreshTokenInput,
  RegisterInput,
  ResetPasswordInput,
} from './auth.schema.js';
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshUserToken,
  registerUser,
  requestPasswordReset,
  resetUserPassword,
} from './auth.service.js';

/**
 * Handle user registration request (POST /api/v1/auth/register).
 *
 * @param req - Express request containing validated RegisterInput in body
 * @param res - Express response
 * @param next - Express next function
 */
export async function register(
  req: Request<unknown, unknown, RegisterInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await registerUser(req.body);
    res.status(201).json(successResponse({ user }, 'User registered successfully'));
  } catch (error) {
    next(error);
  }
}

/**
 * Handle user login request (POST /api/v1/auth/login).
 *
 * @param req - Express request containing validated LoginInput in body
 * @param res - Express response
 * @param next - Express next function
 */
export async function login(
  req: Request<unknown, unknown, LoginInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await loginUser(req.body);
    res.status(200).json(successResponse(result, 'Login successful'));
  } catch (error) {
    next(error);
  }
}

/**
 * Handle token refresh request (POST /api/v1/auth/refresh).
 * Accepts refresh token, validates against DB, rotates it, and issues fresh tokens.
 *
 * @param req - Express request containing validated RefreshTokenInput in body
 * @param res - Express response
 * @param next - Express next function
 */
export async function refresh(
  req: Request<unknown, unknown, RefreshTokenInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await refreshUserToken(req.body);
    res.status(200).json(successResponse(result, 'Tokens refreshed successfully'));
  } catch (error) {
    next(error);
  }
}

/**
 * Handle get current user request (GET /api/v1/auth/me).
 * Returns the authenticated user's profile details.
 *
 * @param req - Express request with attached authenticated user
 * @param res - Express response
 * @param next - Express next function
 */
export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    const user = await getCurrentUser(req.user.userId);
    res.status(200).json(successResponse({ user }, 'User profile retrieved successfully'));
  } catch (error) {
    next(error);
  }
}

/**
 * Handle user logout request (POST /api/v1/auth/logout).
 * Revokes the refresh token session in PostgreSQL, preventing further token refreshes.
 *
 * @param req - Express request containing validated LogoutInput in body
 * @param res - Express response
 * @param next - Express next function
 */
export async function logout(
  req: Request<unknown, unknown, LogoutInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await logoutUser(req.body);
    res.status(200).json(successResponse(null, 'Logged out successfully'));
  } catch (error) {
    next(error);
  }
}

/**
 * Handle forgot password request (POST /api/v1/auth/forgot-password).
 * Always returns a generic success message regardless of whether the email exists,
 * preventing user enumeration attacks.
 *
 * @param req - Express request containing validated ForgotPasswordInput in body
 * @param res - Express response
 * @param next - Express next function
 */
export async function forgotPassword(
  req: Request<unknown, unknown, ForgotPasswordInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await requestPasswordReset(req.body);
    if (result.resetToken && env.NODE_ENV === 'development') {
      console.log(`[DEV ONLY] Password reset token for ${req.body.email}: ${result.resetToken}`);
    }
    res
      .status(200)
      .json(
        successResponse(
          null,
          'If an account with that email exists, password reset instructions have been sent.',
        ),
      );
  } catch (error) {
    next(error);
  }
}

/**
 * Handle reset password request (POST /api/v1/auth/reset-password).
 * Validates the reset token, updates password hash, invalidates token, and revokes sessions.
 *
 * @param req - Express request containing validated ResetPasswordInput in body
 * @param res - Express response
 * @param next - Express next function
 */
export async function resetPassword(
  req: Request<unknown, unknown, ResetPasswordInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await resetUserPassword(req.body);
    res.status(200).json(successResponse(null, 'Password has been reset successfully'));
  } catch (error) {
    next(error);
  }
}
