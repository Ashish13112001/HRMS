import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { errorResponse } from '../utils/apiResponse.js';
import { AppError } from '../utils/appError.js';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json(errorResponse('The requested resource was not found', 'NOT_FOUND'));
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(errorResponse(err.message, err.code));
    return;
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => issue.message).join('; ');
    res.status(400).json(errorResponse(details, 'VALIDATION_ERROR'));
    return;
  }

  console.error(err);

  if (env.NODE_ENV !== 'production' && err instanceof Error) {
    res.status(500).json(errorResponse(err.message, 'INTERNAL_SERVER_ERROR'));
    return;
  }

  res.status(500).json(errorResponse('An unexpected error occurred', 'INTERNAL_SERVER_ERROR'));
}
