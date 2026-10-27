import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { env } from '../../../config/env.js';

export interface AccessTokenPayload {
  userId: string;
  email: string;
  organizationId?: string | null;
  role?: string | null;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId?: string;
}

const DEFAULT_ACCESS_EXPIRES_IN = '15m';
const DEFAULT_REFRESH_EXPIRES_IN = '7d';

/**
 * Generate a signed JWT access token.
 *
 * @param payload - User data to embed in the access token
 * @param expiresIn - Token expiration duration (defaults to 15m)
 * @returns Signed JWT string
 */
export function createAccessToken(
  payload: AccessTokenPayload,
  expiresIn: SignOptions['expiresIn'] = DEFAULT_ACCESS_EXPIRES_IN,
): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

/**
 * Verify and decode a JWT access token using the access secret.
 *
 * @param token - Signed JWT access token
 * @returns Decoded token payload
 * @throws JsonWebTokenError | TokenExpiredError if invalid or expired
 */
export function verifyAccessToken(token: string): AccessTokenPayload & JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload & JwtPayload;
}

/**
 * Generate a signed JWT refresh token.
 *
 * @param payload - User data or token identifier to embed in the refresh token
 * @param expiresIn - Token expiration duration (defaults to 7d)
 * @returns Signed JWT string
 */
export function createRefreshToken(
  payload: RefreshTokenPayload,
  expiresIn: SignOptions['expiresIn'] = DEFAULT_REFRESH_EXPIRES_IN,
): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn });
}

/**
 * Verify and decode a JWT refresh token using the refresh secret.
 *
 * @param token - Signed JWT refresh token
 * @returns Decoded token payload
 * @throws JsonWebTokenError | TokenExpiredError if invalid or expired
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload & JwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload & JwtPayload;
}
