import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../modules/auth/utils/token.js';
import { AppError } from '../utils/appError.js';

/**
 * Authentication middleware that verifies JWT access tokens from the Authorization header.
 * Attaches the verified user payload to the Express request object (`req.user`).
 *
 * Expected header format: `Authorization: Bearer <accessToken>`
 *
 * @throws AppError(401, 'UNAUTHORIZED') if token is missing, malformed, invalid, or expired
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    next(new AppError(401, 'Authorization header is required', 'UNAUTHORIZED'));
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1] || parts[1].trim() === '') {
    next(new AppError(401, 'Invalid authorization format. Format must be: Bearer <token>', 'UNAUTHORIZED'));
    return;
  }

  const token = parts[1].trim();

  try {
    const decoded = verifyAccessToken(token);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role ?? null,
      organizationId: decoded.organizationId ?? null,
    };

    next();
  } catch (error) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      next(new AppError(401, 'Access token has expired', 'UNAUTHORIZED'));
      return;
    }

    next(new AppError(401, 'Invalid access token', 'UNAUTHORIZED'));
  }
}

