import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';

const app = createApp();

describe('GET /api/v1/health', () => {
  it('returns a successful health payload', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Service is healthy');
    expect(response.body.data.status).toBe('ok');
    expect(typeof response.body.data.timestamp).toBe('string');
  });

  it('returns a standard error for unknown routes', async () => {
    const response = await request(app).get('/api/v1/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: 'The requested resource was not found',
      code: 'NOT_FOUND',
    });
  });
});
