import type { NextFunction, Request, Response } from 'express';
import { successResponse } from '../../utils/apiResponse.js';
import type { RegisterInput } from './auth.schema.js';
import { registerUser } from './auth.service.js';

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
