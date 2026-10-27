import type { NextFunction, Request, Response } from 'express';
import { type ZodType } from 'zod';
import { AppError } from '../utils/appError.js';

/**
 * Middleware factory to validate Express request bodies using Zod schemas.
 *
 * @param schema - The Zod schema to validate against
 */
export function validateBody(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join('; ');
      next(new AppError(400, message, 'VALIDATION_ERROR'));
      return;
    }
    req.body = result.data;
    next();
  };
}
