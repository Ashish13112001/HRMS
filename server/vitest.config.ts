import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { defineConfig } from 'vitest/config';

const envFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env');
dotenv.config({ path: envFile });

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      PORT: '3000',
      DATABASE_URL:
        process.env.DATABASE_URL ?? 'postgresql://user:password@localhost:5432/hrms_test',
      JWT_SECRET: process.env.JWT_SECRET ?? 'test-access-secret',
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? 'test-refresh-secret',
      CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    },
  },
});
