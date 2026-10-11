import { z } from 'zod';

const clientEnvSchema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:3000'),
});

const parsed = clientEnvSchema.parse({
  VITE_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

export const apiBaseUrl = parsed.VITE_API_URL;
