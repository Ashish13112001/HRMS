import type { Request, Response } from 'express';
import { successResponse } from '../../utils/apiResponse.js';
import { getHealthStatus } from './health.service.js';

export function getHealth(_req: Request, res: Response): void {
  res.status(200).json(successResponse(getHealthStatus(), 'Service is healthy'));
}
