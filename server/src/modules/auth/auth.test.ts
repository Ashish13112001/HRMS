import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { prisma } from '../../config/prisma.js';
import { comparePassword, hashPassword } from './utils/password.js';
import { verifyAccessToken, verifyRefreshToken } from './utils/token.js';

const app = createApp();

describe('POST /api/v1/auth/register (P2-2.2)', () => {
  const timestamp = Date.now();
  const testEmail = `test-reg-${timestamp}@example.com`;
  const rawPassword = 'StrongPassword123!';

  afterAll(async () => {
    // Clean up all users and refresh tokens created by this test suite
    await prisma.refreshToken.deleteMany({
      where: {
        user: {
          email: {
            contains: 'test-reg-',
          },
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test-reg-',
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('Success Flow', () => {
    it('creates a user and returns 201 with sanitized user payload', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: rawPassword,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');

      const user = response.body.data.user;
      expect(user).toBeDefined();
      expect(typeof user.id).toBe('string');
      expect(user.email).toBe(testEmail);
      expect(user.status).toBe('ACTIVE');
      expect(user.organizationId).toBeNull();
      expect(user.role).toBeNull();
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();

      // Verify the user is actually stored in PostgreSQL
      const dbUser = await prisma.user.findUnique({
        where: { email: testEmail },
      });
      expect(dbUser).not.toBeNull();
      expect(dbUser?.id).toBe(user.id);
      expect(dbUser?.email).toBe(testEmail);
      expect(dbUser?.status).toBe('ACTIVE');
    });

    it('normalizes email by trimming whitespace and lowercasing', async () => {
      const unnormalizedEmail = `  TEST-REG-NORMALIZED-${timestamp}@Example.COM  `;
      const expectedEmail = `test-reg-normalized-${timestamp}@example.com`;

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: unnormalizedEmail,
          password: rawPassword,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.user.email).toBe(expectedEmail);

      const dbUser = await prisma.user.findUnique({
        where: { email: expectedEmail },
      });
      expect(dbUser).not.toBeNull();
      expect(dbUser?.email).toBe(expectedEmail);
    });
  });

  describe('Password Security & Omission', () => {
    it('does not expose password or passwordHash in response body', async () => {
      const secureEmail = `test-reg-sec-${timestamp}@example.com`;

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: secureEmail,
          password: rawPassword,
        });

      expect(response.status).toBe(201);
      const user = response.body.data.user;

      // Verify explicit field omission
      expect(user.password).toBeUndefined();
      expect(user.passwordHash).toBeUndefined();

      // Verify raw password is nowhere in the serialized JSON response
      const responseString = JSON.stringify(response.body);
      expect(responseString).not.toContain(rawPassword);
      expect(responseString).not.toContain('passwordHash');

      // Verify password is encrypted in database and matches bcrypt format
      const dbUser = await prisma.user.findUnique({
        where: { email: secureEmail },
      });
      expect(dbUser).not.toBeNull();
      expect(dbUser?.passwordHash).not.toBe(rawPassword);
      expect(dbUser?.passwordHash).toMatch(/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/);

      // Verify the stored hash verifies with comparePassword
      const isValid = await comparePassword(rawPassword, dbUser!.passwordHash);
      expect(isValid).toBe(true);
    });
  });

  describe('Validation & Error Handling', () => {
    it('returns 400 VALIDATION_ERROR when email is missing', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          password: rawPassword,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: expect.stringContaining('Email is required'),
        code: 'VALIDATION_ERROR',
      });
    });

    it('returns 400 VALIDATION_ERROR when email is empty string or only whitespace', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: '   ',
          password: rawPassword,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: expect.stringContaining('Email is required'),
        code: 'VALIDATION_ERROR',
      });
    });

    it('returns 400 VALIDATION_ERROR when email format is invalid', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'not-a-valid-email',
          password: rawPassword,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: expect.stringContaining('Invalid email address'),
        code: 'VALIDATION_ERROR',
      });
    });

    it('returns 400 VALIDATION_ERROR when password is missing', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `test-reg-val-${timestamp}@example.com`,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: expect.stringContaining('Password is required'),
        code: 'VALIDATION_ERROR',
      });
    });

    it('returns 400 VALIDATION_ERROR when password is under 8 characters', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `test-reg-val-${timestamp}@example.com`,
          password: 'short',
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: expect.stringContaining('Password must be at least 8 characters long'),
        code: 'VALIDATION_ERROR',
      });
    });

    it('returns 400 VALIDATION_ERROR when request body is empty', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Duplicate Email Rejection', () => {
    it('returns 409 CONFLICT when email is already registered', async () => {
      // testEmail was already registered in the first test
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: 'AnotherPassword123!',
        });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        success: false,
        message: 'User with this email already exists',
        code: 'CONFLICT',
      });
    });

    it('returns 409 CONFLICT when email differs only in case', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testEmail.toUpperCase(),
          password: 'AnotherPassword123!',
        });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        success: false,
        message: 'User with this email already exists',
        code: 'CONFLICT',
      });
    });
  });
});

describe('POST /api/v1/auth/login (P2-3.2)', () => {
  const timestamp = Date.now();
  const loginEmail = `test-login-${timestamp}@example.com`;
  const rawPassword = 'ValidLoginPassword123!';
  const inactiveEmail = `test-login-inactive-${timestamp}@example.com`;
  let activeUserId: string;

  beforeAll(async () => {
    const passwordHash = await hashPassword(rawPassword);

    const activeUser = await prisma.user.create({
      data: {
        email: loginEmail,
        passwordHash,
        status: 'ACTIVE',
      },
    });
    activeUserId = activeUser.id;

    await prisma.user.create({
      data: {
        email: inactiveEmail,
        passwordHash,
        status: 'INACTIVE',
      },
    });
  });

  afterAll(async () => {
    // Clean up test users and refresh tokens
    await prisma.refreshToken.deleteMany({
      where: {
        user: {
          email: {
            contains: 'test-login-',
          },
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test-login-',
        },
      },
    });
  });

  describe('Successful Login', () => {
    it('authenticates with valid credentials and returns 200 with tokens and sanitized user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: loginEmail,
          password: rawPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');

      const { user, tokens } = response.body.data;

      // User payload assertions
      expect(user).toBeDefined();
      expect(user.id).toBe(activeUserId);
      expect(user.email).toBe(loginEmail);
      expect(user.status).toBe('ACTIVE');
      expect(user.organizationId).toBeNull();
      expect(user.role).toBeNull();
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();

      // Tokens payload assertions
      expect(tokens).toBeDefined();
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');

      // Verify access token validity and claims
      const decodedAccess = verifyAccessToken(tokens.accessToken);
      expect(decodedAccess.userId).toBe(activeUserId);
      expect(decodedAccess.email).toBe(loginEmail);

      // Verify refresh token validity and claims
      const decodedRefresh = verifyRefreshToken(tokens.refreshToken);
      expect(decodedRefresh.userId).toBe(activeUserId);
      expect(decodedRefresh.tokenId).toBeDefined();

      // Verify refresh token session is persisted in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { id: decodedRefresh.tokenId as string },
      });
      expect(storedToken).not.toBeNull();
      expect(storedToken?.userId).toBe(activeUserId);
      expect(storedToken?.token).toBe(tokens.refreshToken);
      expect(storedToken?.revokedAt).toBeNull();
      expect(new Date(storedToken!.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });

    it('normalizes email during login (whitespace and case-insensitive)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: `  ${loginEmail.toUpperCase()}  `,
          password: rawPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(loginEmail);
    });

    it('omits sensitive fields (password, passwordHash) from response', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: loginEmail,
          password: rawPassword,
        });

      expect(response.status).toBe(200);
      const user = response.body.data.user;

      expect(user.password).toBeUndefined();
      expect(user.passwordHash).toBeUndefined();

      const responseString = JSON.stringify(response.body);
      expect(responseString).not.toContain(rawPassword);
      expect(responseString).not.toContain('passwordHash');
    });
  });

  describe('Invalid Credentials & Security', () => {
    it('returns 401 UNAUTHORIZED with generic error when password is incorrect', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: loginEmail,
          password: 'IncorrectPassword999!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid email or password',
        code: 'UNAUTHORIZED',
      });
    });

    it('returns 401 UNAUTHORIZED with identical generic error when email does not exist', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: `non-existent-${timestamp}@example.com`,
          password: rawPassword,
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid email or password',
        code: 'UNAUTHORIZED',
      });
    });

    it('returns 403 FORBIDDEN when user account is not active', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: inactiveEmail,
          password: rawPassword,
        });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        success: false,
        message: 'Your account is inactive. Please contact support.',
        code: 'FORBIDDEN',
      });
    });
  });

  describe('Validation & Error Handling', () => {
    it('returns 400 VALIDATION_ERROR when email is missing', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          password: rawPassword,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: expect.stringContaining('Email is required'),
        code: 'VALIDATION_ERROR',
      });
    });

    it('returns 400 VALIDATION_ERROR when email is empty or only whitespace', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: '   ',
          password: rawPassword,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: expect.stringContaining('Email is required'),
        code: 'VALIDATION_ERROR',
      });
    });

    it('returns 400 VALIDATION_ERROR when email format is invalid', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email-format',
          password: rawPassword,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: expect.stringContaining('Invalid email address'),
        code: 'VALIDATION_ERROR',
      });
    });

    it('returns 400 VALIDATION_ERROR when password is missing', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: loginEmail,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: expect.stringContaining('Password is required'),
        code: 'VALIDATION_ERROR',
      });
    });

    it('returns 400 VALIDATION_ERROR when password is empty', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: loginEmail,
          password: '',
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: expect.stringContaining('Password is required'),
        code: 'VALIDATION_ERROR',
      });
    });

    it('returns 400 VALIDATION_ERROR when request body is empty', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });
});
