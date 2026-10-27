import { randomUUID } from 'node:crypto';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';
import type { LoginInput, RegisterInput } from './auth.schema.js';
import { comparePassword, hashPassword } from './utils/password.js';
import {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  type AccessTokenPayload,
  type RefreshTokenPayload,
} from './utils/token.js';

export type UserSafe = {
  id: string;
  email: string;
  status: string;
  organizationId: string | null;
  role: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResult {
  user: UserSafe;
  tokens: AuthTokens;
}

/**
 * Register a new user in the system.
 * Checks for email duplication, hashes password with bcrypt,
 * persists the user, and returns safe user fields omitting sensitive hashes.
 *
 * @param input - Validated registration input (email and plain password)
 * @returns Promise resolving to the created user safe fields
 * @throws AppError(409, 'CONFLICT') if the email is already registered
 */
export async function registerUser(input: RegisterInput): Promise<UserSafe> {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new AppError(409, 'User with this email already exists', 'CONFLICT');
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      status: 'ACTIVE',
    },
  });

  return {
    id: user.id,
    email: user.email,
    status: user.status,
    organizationId: user.organizationId,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Authenticate a user by email and password.
 * Verifies credentials, checks active status, generates access & refresh tokens,
 * persists the refresh token session in the database, and returns safe user data with tokens.
 *
 * @param input - Validated login input (email and plain password)
 * @returns Promise resolving to the safe user data and tokens
 * @throws AppError(401, 'UNAUTHORIZED') if credentials are invalid (generic message)
 * @throws AppError(403, 'FORBIDDEN') if the user account is not active
 */
export async function loginUser(input: LoginInput): Promise<LoginResult> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new AppError(401, 'Invalid email or password', 'UNAUTHORIZED');
  }

  const isPasswordValid = await comparePassword(input.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid email or password', 'UNAUTHORIZED');
  }

  if (user.status !== 'ACTIVE') {
    throw new AppError(403, 'Your account is inactive. Please contact support.', 'FORBIDDEN');
  }

  const accessToken = createAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
  });

  const tokenId = randomUUID();
  const refreshToken = createRefreshToken({
    userId: user.id,
    tokenId,
  });

  // Calculate 7-day expiration for the refresh token record
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      id: tokenId,
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      status: user.status,
      organizationId: user.organizationId,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  };
}

export {
  comparePassword,
  hashPassword,
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  type AccessTokenPayload,
  type RefreshTokenPayload,
};
