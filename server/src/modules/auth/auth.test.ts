import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { prisma } from '../../config/prisma.js';
import { comparePassword, hashPassword } from './utils/password.js';
import { createAccessToken, createRefreshToken, verifyAccessToken, verifyRefreshToken } from './utils/token.js';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';

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

describe('POST /api/v1/auth/refresh (P2-4.1 / P2-4.2)', () => {
  const timestamp = Date.now();
  const refreshEmail = `test-refresh-${timestamp}@example.com`;
  const rawPassword = 'ValidPassword123!';
  const inactiveRefreshEmail = `test-refresh-inactive-${timestamp}@example.com`;
  let activeUserId: string;
  let inactiveUserId: string;

  beforeAll(async () => {
    const passwordHash = await hashPassword(rawPassword);

    const activeUser = await prisma.user.create({
      data: {
        email: refreshEmail,
        passwordHash,
        status: 'ACTIVE',
      },
    });
    activeUserId = activeUser.id;

    const inactiveUser = await prisma.user.create({
      data: {
        email: inactiveRefreshEmail,
        passwordHash,
        status: 'INACTIVE',
      },
    });
    inactiveUserId = inactiveUser.id;
  });

  afterAll(async () => {
    // Clean up test users and refresh tokens
    await prisma.refreshToken.deleteMany({
      where: {
        user: {
          email: {
            contains: 'test-refresh-',
          },
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test-refresh-',
        },
      },
    });
  });

  describe('Successful Refresh and Rotation', () => {
    it('refreshes tokens, rotates refresh token, and stores session in PostgreSQL', async () => {
      // 1. Login to obtain an initial token pair
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: refreshEmail,
          password: rawPassword,
        });

      expect(loginResponse.status).toBe(200);
      const initialRefreshToken = loginResponse.body.data.tokens.refreshToken;
      const initialAccessToken = loginResponse.body.data.tokens.accessToken;

      // 2. Perform refresh
      const refreshResponse = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: initialRefreshToken,
        });

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.body.success).toBe(true);
      expect(refreshResponse.body.message).toBe('Tokens refreshed successfully');

      const { tokens, accessToken, refreshToken } = refreshResponse.body.data;
      expect(tokens).toBeDefined();
      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();

      // Ensure tokens are fresh and rotated
      expect(typeof accessToken).toBe('string');
      expect(refreshToken).not.toBe(initialRefreshToken);

      // Verify claims on new access token
      const decodedAccess = verifyAccessToken(accessToken);
      expect(decodedAccess.userId).toBe(activeUserId);
      expect(decodedAccess.email).toBe(refreshEmail);

      // Verify claims on new refresh token
      const decodedRefresh = verifyRefreshToken(refreshToken);
      expect(decodedRefresh.userId).toBe(activeUserId);
      expect(decodedRefresh.tokenId).toBeDefined();

      // 3. Verify PostgreSQL states:
      // Previous token MUST be revoked (revokedAt != null)
      const previousTokenRecord = await prisma.refreshToken.findUnique({
        where: { token: initialRefreshToken },
      });
      expect(previousTokenRecord).not.toBeNull();
      expect(previousTokenRecord?.revokedAt).not.toBeNull();

      // New token MUST be active (revokedAt == null)
      const newTokenRecord = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });
      expect(newTokenRecord).not.toBeNull();
      expect(newTokenRecord?.userId).toBe(activeUserId);
      expect(newTokenRecord?.revokedAt).toBeNull();
      expect(new Date(newTokenRecord!.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('Security & Token Rotation Invalidation', () => {
    it('rejects an already used/rotated refresh token and revokes the active token family (Reuse Detection)', async () => {
      // 1. Login
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: refreshEmail,
          password: rawPassword,
        });
      const firstRefreshToken = loginResponse.body.data.tokens.refreshToken;

      // 2. First refresh (valid rotation)
      const firstRefresh = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: firstRefreshToken,
        });
      expect(firstRefresh.status).toBe(200);
      const secondRefreshToken = firstRefresh.body.data.tokens.refreshToken;

      // 3. Attempt to REUSE the first token (which was already rotated)
      const reuseAttempt = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: firstRefreshToken,
        });

      expect(reuseAttempt.status).toBe(401);
      expect(reuseAttempt.body).toEqual({
        success: false,
        message: 'Invalid or expired refresh token',
        code: 'UNAUTHORIZED',
      });

      // 4. Verify Reuse Detection: The active token family (secondRefreshToken) must now be revoked
      const compromisedToken = await prisma.refreshToken.findUnique({
        where: { token: secondRefreshToken },
      });
      expect(compromisedToken?.revokedAt).not.toBeNull();

      // 5. Subsequent attempt using secondRefreshToken also fails
      const subsequentAttempt = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: secondRefreshToken,
        });

      expect(subsequentAttempt.status).toBe(401);
      expect(subsequentAttempt.body.code).toBe('UNAUTHORIZED');
    });

    it('rejects an invalid or malformed refresh token string', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: 'not-a-valid-jwt-token-string',
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid or expired refresh token',
        code: 'UNAUTHORIZED',
      });
    });

    it('rejects a refresh token signed with an untrusted secret', async () => {
      const foreignToken = jwt.sign(
        { userId: activeUserId, tokenId: randomUUID() },
        'untrusted-secret-key-12345678901234567890',
        { expiresIn: '7d' },
      );

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: foreignToken,
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid or expired refresh token',
        code: 'UNAUTHORIZED',
      });
    });

    it('rejects a valid JWT refresh token that does not exist in the database', async () => {
      const unpersistedToken = createRefreshToken({
        userId: activeUserId,
        tokenId: randomUUID(),
      });

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: unpersistedToken,
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid or expired refresh token',
        code: 'UNAUTHORIZED',
      });
    });

    it('rejects an expired refresh token (database expiresAt in the past)', async () => {
      const tokenId = randomUUID();
      const expiredTokenString = createRefreshToken({
        userId: activeUserId,
        tokenId,
      });

      await prisma.refreshToken.create({
        data: {
          id: tokenId,
          token: expiredTokenString,
          userId: activeUserId,
          expiresAt: new Date(Date.now() - 60000), // 1 minute in the past
        },
      });

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: expiredTokenString,
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid or expired refresh token',
        code: 'UNAUTHORIZED',
      });
    });

    it('rejects refresh for an inactive user account', async () => {
      const tokenId = randomUUID();
      const inactiveUserToken = createRefreshToken({
        userId: inactiveUserId,
        tokenId,
      });

      await prisma.refreshToken.create({
        data: {
          id: tokenId,
          token: inactiveUserToken,
          userId: inactiveUserId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: inactiveUserToken,
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
    it('returns 400 VALIDATION_ERROR when refreshToken is missing', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: expect.stringContaining('Refresh token is required'),
        code: 'VALIDATION_ERROR',
      });
    });

    it('returns 400 VALIDATION_ERROR when refreshToken is empty string', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: '',
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: expect.stringContaining('Refresh token is required'),
        code: 'VALIDATION_ERROR',
      });
    });
  });
});

describe('GET /api/v1/auth/me & Authentication Middleware (P2-5.1 / P2-5.2)', () => {
  const timestamp = Date.now();
  const meUserEmail = `test-me-${timestamp}@example.com`;
  const rawPassword = 'ValidPassword123!';
  const inactiveMeEmail = `test-me-inactive-${timestamp}@example.com`;
  let activeUserId: string;
  let inactiveUserId: string;
  let validAccessToken: string;

  beforeAll(async () => {
    const passwordHash = await hashPassword(rawPassword);

    const activeUser = await prisma.user.create({
      data: {
        email: meUserEmail,
        passwordHash,
        status: 'ACTIVE',
      },
    });
    activeUserId = activeUser.id;

    const inactiveUser = await prisma.user.create({
      data: {
        email: inactiveMeEmail,
        passwordHash,
        status: 'INACTIVE',
      },
    });
    inactiveUserId = inactiveUser.id;

    // Login to get a valid access token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: meUserEmail,
        password: rawPassword,
      });
    validAccessToken = loginResponse.body.data.tokens.accessToken;
  });

  afterAll(async () => {
    // Clean up test users and refresh tokens
    await prisma.refreshToken.deleteMany({
      where: {
        user: {
          email: {
            contains: 'test-me-',
          },
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test-me-',
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('Successful Profile Retrieval', () => {
    it('returns 200 and the authenticated user profile when a valid Bearer token is provided', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${validAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User profile retrieved successfully');

      const user = response.body.data.user;
      expect(user).toBeDefined();
      expect(user.id).toBe(activeUserId);
      expect(user.email).toBe(meUserEmail);
      expect(user.status).toBe('ACTIVE');
      expect(user.organizationId).toBeNull();
      expect(user.role).toBeNull();
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();

      // Ensure sensitive credentials are never exposed
      expect(user.password).toBeUndefined();
      expect(user.passwordHash).toBeUndefined();
      expect(JSON.stringify(response.body)).not.toContain('passwordHash');
    });
  });

  describe('Authentication Failure & Rejections', () => {
    it('returns 401 UNAUTHORIZED when Authorization header is missing', async () => {
      const response = await request(app).get('/api/v1/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: 'Authorization header is required',
        code: 'UNAUTHORIZED',
      });
    });

    it('returns 401 UNAUTHORIZED when Authorization header does not use Bearer scheme', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Basic ${validAccessToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid authorization format. Format must be: Bearer <token>',
        code: 'UNAUTHORIZED',
      });
    });

    it('returns 401 UNAUTHORIZED when Bearer token is empty or whitespace', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer ');

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });

    it('returns 401 UNAUTHORIZED when token is malformed', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token-string');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid access token',
        code: 'UNAUTHORIZED',
      });
    });

    it('returns 401 UNAUTHORIZED when token is signed with untrusted secret', async () => {
      const foreignToken = jwt.sign(
        { userId: activeUserId, email: meUserEmail },
        'untrusted-secret-key-1234567890',
        { expiresIn: '15m' },
      );

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${foreignToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid access token',
        code: 'UNAUTHORIZED',
      });
    });

    it('returns 401 UNAUTHORIZED when a refresh token is supplied instead of an access token', async () => {
      const refreshToken = createRefreshToken({
        userId: activeUserId,
        tokenId: randomUUID(),
      });

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${refreshToken}`);

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });

    it('returns 401 UNAUTHORIZED when access token has expired', async () => {
      const expiredToken = createAccessToken(
        { userId: activeUserId, email: meUserEmail },
        -1, // expired immediately
      );

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: 'Access token has expired',
        code: 'UNAUTHORIZED',
      });
    });

    it('returns 403 FORBIDDEN when user account is inactive', async () => {
      const inactiveUserToken = createAccessToken({
        userId: inactiveUserId,
        email: inactiveMeEmail,
      });

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${inactiveUserToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        success: false,
        message: 'Your account is inactive. Please contact support.',
        code: 'FORBIDDEN',
      });
    });
  });

  describe('Public Endpoint Isolation', () => {
    it('allows access to public /api/v1/health without any authentication header', async () => {
      const response = await request(app).get('/api/v1/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('ok');
    });
  });
});

