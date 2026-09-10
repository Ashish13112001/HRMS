import { healthDataSchema, type HealthData } from '../schemas/health';
import type { ApiError, ApiSuccess } from '../types/api';
import { apiBaseUrl } from '../utils/env';

function isApiSuccess<T>(value: unknown): value is ApiSuccess<T> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return record.success === true && 'data' in record && typeof record.message === 'string';
}

function isApiError(value: unknown): value is ApiError {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return record.success === false && typeof record.message === 'string' && typeof record.code === 'string';
}

export async function fetchHealth(): Promise<HealthData> {
  const response = await fetch(`${apiBaseUrl}/api/v1/health`);
  const body: unknown = await response.json();

  if (!response.ok) {
    const message = isApiError(body) ? body.message : 'Unable to load API health';
    throw new Error(message);
  }

  if (!isApiSuccess<unknown>(body)) {
    throw new Error('Health response was not in the expected format');
  }

  return healthDataSchema.parse(body.data);
}
