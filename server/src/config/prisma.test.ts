import { afterAll, describe, expect, it } from 'vitest';
import { prisma } from './prisma.js';

describe('Prisma Authentication Database Integration (P2-1.1)', () => {
  const testEmail = `test-user-${Date.now()}@example.com`;

  afterAll(async () => {
    // Clean up test records
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test-user-',
        },
      },
    });
    await prisma.$disconnect();
  });

  it('connects to PostgreSQL and queries the User table', async () => {
    const userCount = await prisma.user.count();
    expect(typeof userCount).toBe('number');
  });

  it('creates and retrieves a User with required fields and nullable organizationId and role', async () => {
    const createdUser = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        // status defaults to 'ACTIVE'
        organizationId: null,
        role: null,
      },
    });

    expect(createdUser.id).toBeDefined();
    expect(typeof createdUser.id).toBe('string');
    expect(createdUser.email).toBe(testEmail);
    expect(createdUser.passwordHash).toBe('$2b$10$abcdefghijklmnopqrstuvwxyz123456');
    expect(createdUser.status).toBe('ACTIVE');
    expect(createdUser.organizationId).toBeNull();
    expect(createdUser.role).toBeNull();
    expect(createdUser.createdAt).toBeInstanceOf(Date);
    expect(createdUser.updatedAt).toBeInstanceOf(Date);

    const fetchedUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    expect(fetchedUser).not.toBeNull();
    expect(fetchedUser?.id).toBe(createdUser.id);
  });

  it('enforces unique email constraint', async () => {
    await expect(
      prisma.user.create({
        data: {
          email: testEmail,
          passwordHash: 'another-hash',
        },
      }),
    ).rejects.toThrow();
  });
});
