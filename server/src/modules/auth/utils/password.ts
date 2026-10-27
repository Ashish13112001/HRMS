import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hash a plain-text password using bcrypt.
 *
 * @param password - The plain-text password to hash
 * @returns Promise resolving to the hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a candidate plain-text password against a stored bcrypt hash.
 * Uses constant-time comparison internally to prevent timing attacks.
 *
 * @param password - The candidate plain-text password
 * @param hash - The stored password hash
 * @returns Promise resolving to boolean indicating match
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
