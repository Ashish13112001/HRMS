import type { NextFunction, Request, Response } from 'express';
import { successResponse } from '../../utils/apiResponse.js';
import type { LoginInput, RegisterInput } from './auth.schema.js';
import { loginUser, registerUser } from './auth.service.js';

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
