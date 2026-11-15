import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';
import type {
  ForgotPasswordInput,
  LoginInput,
  LogoutInput,
  RefreshTokenInput,
  RegisterInput,
  ResetPasswordInput,
} from './auth.schema.js';
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

export interface RefreshResult {
  tokens: AuthTokens;
  accessToken: string;
  refreshToken: string;
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

/**
 * Refresh authentication tokens using an existing refresh token with automatic rotation.
 * Verifies JWT signature, validates token status in PostgreSQL, checks for reuse/revocation,
 * checks user account active status, and atomically revokes the old token while issuing a new pair.
 *
 * If reuse is detected (attempting to use an already revoked token), all active tokens for the user
 * are immediately revoked to protect against compromised session theft.
 *
 * @param input - Validated refresh token input
 * @returns Promise resolving to newly generated tokens
 * @throws AppError(401, 'UNAUTHORIZED') if token is invalid, expired, revoked, or reused
 * @throws AppError(403, 'FORBIDDEN') if user account is inactive
 */
export async function refreshUserToken(input: RefreshTokenInput): Promise<RefreshResult> {
  let payload: RefreshTokenPayload;

  try {
    payload = verifyRefreshToken(input.refreshToken);
  } catch {
    throw new AppError(401, 'Invalid or expired refresh token', 'UNAUTHORIZED');
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: input.refreshToken },
    include: { user: true },
  });

  if (!storedToken || !storedToken.user) {
    throw new AppError(401, 'Invalid or expired refresh token', 'UNAUTHORIZED');
  }

  // Reuse Detection: If an already-revoked token is used, compromise is detected!
  if (storedToken.revokedAt !== null) {
    // Invalidate all active refresh tokens for this user family as a security precaution
    await prisma.refreshToken.updateMany({
      where: {
        userId: storedToken.userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    throw new AppError(401, 'Invalid or expired refresh token', 'UNAUTHORIZED');
  }

  // User status check
  if (storedToken.user.status !== 'ACTIVE') {
    throw new AppError(403, 'Your account is inactive. Please contact support.', 'FORBIDDEN');
  }

  // Expiration check against DB expiresAt
  if (storedToken.expiresAt.getTime() <= Date.now()) {
    throw new AppError(401, 'Invalid or expired refresh token', 'UNAUTHORIZED');
  }

  // Generate new access and refresh tokens
  const newAccessToken = createAccessToken({
    userId: storedToken.user.id,
    email: storedToken.user.email,
    role: storedToken.user.role,
    organizationId: storedToken.user.organizationId,
  });

  const newTokenId = randomUUID();
  const newRefreshToken = createRefreshToken({
    userId: storedToken.user.id,
    tokenId: newTokenId,
  });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Atomic rotation: invalidate previous refresh token & persist new refresh token
  await prisma.$transaction(async (tx) => {
    await tx.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    await tx.refreshToken.create({
      data: {
        id: newTokenId,
        token: newRefreshToken,
        userId: storedToken.user.id,
        expiresAt,
      },
    });
  });

  return {
    tokens: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    },
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

/**
 * Retrieve the current authenticated user's profile details.
 *
 * @param userId - The ID of the authenticated user
 * @returns Promise resolving to safe user fields
 * @throws AppError(401, 'UNAUTHORIZED') if the user no longer exists
 * @throws AppError(403, 'FORBIDDEN') if the user account is inactive
 */
export async function getCurrentUser(userId: string): Promise<UserSafe> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(401, 'User does not exist', 'UNAUTHORIZED');
  }

  if (user.status !== 'ACTIVE') {
    throw new AppError(403, 'Your account is inactive. Please contact support.', 'FORBIDDEN');
  }

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
 * Invalidate an active refresh token session, logging the user out.
 * Idempotent and safe: if the token is already expired, revoked, or not found,
 * it safely completes so the client can clear its local session state.
 *
 * @param input - Validated logout input containing the refresh token
 * @returns Promise resolving to void
 */
export async function logoutUser(input: LogoutInput): Promise<void> {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: input.refreshToken },
  });

  // If token exists and is currently active, revoke it
  if (storedToken && storedToken.revokedAt === null) {
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });
  }
}

/**
 * Handle forgot password request.
 * Generates a one-time cryptographically secure reset token,
 * persists only its SHA-256 hash with an expiration time,
 * and returns the raw token internally (for delivery/testing).
 *
 * To prevent account enumeration, non-existent or inactive emails
 * complete silently without raising errors or creating tokens.
 *
 * @param input - Validated forgot password input (email)
 * @returns Promise resolving to object containing raw resetToken if generated
 */
export async function requestPasswordReset(
  input: ForgotPasswordInput,
): Promise<{ resetToken?: string }> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  // To prevent user enumeration attacks, if user is not found or inactive,
  // do not leak their status. Silently return without generating a token.
  if (!user || user.status !== 'ACTIVE') {
    return {};
  }

  // Invalidate any existing unused reset tokens for this user
  await prisma.passwordResetToken.updateMany({
    where: {
      userId: user.id,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });

  // Generate secure random plain token (32 bytes = 64 hex characters)
  const rawResetToken = randomBytes(32).toString('hex');

  // Hash the token with SHA-256 before persisting (only hash is stored in database)
  const tokenHash = createHash('sha256').update(rawResetToken).digest('hex');

  // 1-hour expiration
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt,
    },
  });

  return { resetToken: rawResetToken };
}

/**
 * Handle reset password request.
 * Validates the plain reset token against the stored SHA-256 hash in PostgreSQL,
 * verifies it has not expired and has not already been used,
 * updates the user's password with a fresh bcrypt hash,
 * invalidates the reset token, and revokes all active refresh token sessions.
 *
 * @param input - Validated reset password input (plain token and new password)
 * @returns Promise resolving to void
 * @throws AppError(400, 'BAD_REQUEST') if token is invalid, expired, or already used
 * @throws AppError(403, 'FORBIDDEN') if the associated user account is inactive
 */
export async function resetUserPassword(input: ResetPasswordInput): Promise<void> {
  const tokenHash = createHash('sha256').update(input.token).digest('hex');

  const storedToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!storedToken) {
    throw new AppError(400, 'Invalid or expired password reset token', 'BAD_REQUEST');
  }

  // Reject already-used tokens
  if (storedToken.usedAt !== null) {
    throw new AppError(400, 'Password reset token has already been used', 'BAD_REQUEST');
  }

  // Reject expired tokens
  if (storedToken.expiresAt.getTime() <= Date.now()) {
    throw new AppError(400, 'Password reset token has expired', 'BAD_REQUEST');
  }

  // Check user account status
  if (storedToken.user.status !== 'ACTIVE') {
    throw new AppError(403, 'Your account is inactive. Please contact support.', 'FORBIDDEN');
  }

  // Hash the new password using bcrypt
  const passwordHash = await hashPassword(input.password);

  // Atomically invalidate reset token, update user passwordHash, and revoke active sessions
  await prisma.$transaction(async (tx) => {
    // Invalidate the reset token
    await tx.passwordResetToken.update({
      where: { id: storedToken.id },
      data: { usedAt: new Date() },
    });

    // Update user's password hash
    await tx.user.update({
      where: { id: storedToken.userId },
      data: { passwordHash },
    });

    // Revoke all existing refresh token sessions for security
    await tx.refreshToken.updateMany({
      where: {
        userId: storedToken.userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  });
}

export {
  requestPasswordReset as forgotPassword,
  resetUserPassword as resetPassword,
};

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
