import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';
import type { RegisterInput } from './auth.schema.js';
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
