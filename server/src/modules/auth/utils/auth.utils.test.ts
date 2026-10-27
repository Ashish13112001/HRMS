import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import { comparePassword, hashPassword } from './password.js';
import {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  type AccessTokenPayload,
  type RefreshTokenPayload,
} from './token.js';

describe('Authentication Utilities (P2-1.3)', () => {
  describe('Password Hashing & Verification (password.ts)', () => {
    const rawPassword = 'SuperSecretPassword123!';

    it('hashes passwords securely and never returns plain-text', async () => {
      const hash = await hashPassword(rawPassword);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(rawPassword);
      // Valid bcrypt hash structure: starts with $2b$ or $2a$ and has 60 characters
      expect(hash).toMatch(/^\$2[ab]\$\d{2}\$[./A-Za-z0-9]{53}$/);
    });

    it('generates unique salts producing different hashes for the same password', async () => {
      const hash1 = await hashPassword(rawPassword);
      const hash2 = await hashPassword(rawPassword);

      expect(hash1).not.toBe(hash2);
      expect(await comparePassword(rawPassword, hash1)).toBe(true);
      expect(await comparePassword(rawPassword, hash2)).toBe(true);
    });

    it('returns true when comparing matching candidate password with hash', async () => {
      const hash = await hashPassword(rawPassword);
      const isMatch = await comparePassword(rawPassword, hash);

      expect(isMatch).toBe(true);
    });

    it('returns false when comparing incorrect password with hash', async () => {
      const hash = await hashPassword(rawPassword);
      const isMatch = await comparePassword('WrongPassword123!', hash);

      expect(isMatch).toBe(false);
    });
  });

  describe('JWT Access Token Management (token.ts)', () => {
    const accessPayload: AccessTokenPayload = {
      userId: 'user-uuid-1234',
      email: 'user@example.com',
      role: 'Employee',
      organizationId: 'org-uuid-5678',
    };

    it('creates and verifies a valid access token', () => {
      const token = createAccessToken(accessPayload);
      expect(typeof token).toBe('string');

      const decoded = verifyAccessToken(token);
      expect(decoded.userId).toBe(accessPayload.userId);
      expect(decoded.email).toBe(accessPayload.email);
      expect(decoded.role).toBe(accessPayload.role);
      expect(decoded.organizationId).toBe(accessPayload.organizationId);
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });

    it('rejects an invalid or tampered access token', () => {
      const token = createAccessToken(accessPayload);
      const tamperedToken = `${token.slice(0, -6)}tamper`;

      expect(() => verifyAccessToken(tamperedToken)).toThrow(jwt.JsonWebTokenError);
    });

    it('rejects an expired access token', () => {
      // Create token with immediate expiration (-1 second)
      const expiredToken = createAccessToken(accessPayload, -1);

      expect(() => verifyAccessToken(expiredToken)).toThrow(jwt.TokenExpiredError);
    });

    it('rejects an access token signed with an untrusted secret', () => {
      const foreignToken = jwt.sign(accessPayload, 'completely-untrusted-secret', {
        expiresIn: '15m',
      });

      expect(() => verifyAccessToken(foreignToken)).toThrow(jwt.JsonWebTokenError);
    });
  });

  describe('JWT Refresh Token Management (token.ts)', () => {
    const refreshPayload: RefreshTokenPayload = {
      userId: 'user-uuid-1234',
      tokenId: 'token-uuid-9999',
    };

    it('creates and verifies a valid refresh token', () => {
      const token = createRefreshToken(refreshPayload);
      expect(typeof token).toBe('string');

      const decoded = verifyRefreshToken(token);
      expect(decoded.userId).toBe(refreshPayload.userId);
      expect(decoded.tokenId).toBe(refreshPayload.tokenId);
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });

    it('rejects an invalid or tampered refresh token', () => {
      const token = createRefreshToken(refreshPayload);
      const tamperedToken = `${token.slice(0, -6)}tamper`;

      expect(() => verifyRefreshToken(tamperedToken)).toThrow(jwt.JsonWebTokenError);
    });

    it('rejects an expired refresh token', () => {
      // Create token with immediate expiration (-1 second)
      const expiredToken = createRefreshToken(refreshPayload, -1);

      expect(() => verifyRefreshToken(expiredToken)).toThrow(jwt.TokenExpiredError);
    });

    it('rejects a refresh token signed with an untrusted secret', () => {
      const foreignToken = jwt.sign(refreshPayload, 'completely-untrusted-secret', {
        expiresIn: '7d',
      });

      expect(() => verifyRefreshToken(foreignToken)).toThrow(jwt.JsonWebTokenError);
    });
  });

  describe('Secret Boundary & Cross-Token Isolation', () => {
    it('rejects an access token when verified with verifyRefreshToken', () => {
      const accessToken = createAccessToken({
        userId: 'user-uuid-1234',
        email: 'user@example.com',
      });

      // Verification must fail because JWT_SECRET != JWT_REFRESH_SECRET
      expect(() => verifyRefreshToken(accessToken)).toThrow(jwt.JsonWebTokenError);
    });

    it('rejects a refresh token when verified with verifyAccessToken', () => {
      const refreshToken = createRefreshToken({
        userId: 'user-uuid-1234',
      });

      // Verification must fail because JWT_SECRET != JWT_REFRESH_SECRET
      expect(() => verifyAccessToken(refreshToken)).toThrow(jwt.JsonWebTokenError);
    });
  });
});
