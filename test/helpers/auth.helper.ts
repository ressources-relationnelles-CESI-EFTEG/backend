import { createHmac } from 'crypto';
import { genSalt, hash } from 'bcryptjs';
import type { PrismaService } from '../../src/prisma/prisma.service';

const DEFAULT_PASSWORD = 'TestPassword1!';

export interface TestUser {
  id: number;
  email: string;
  token: string;
}

/**
 * Build a signed auth token identical to what AuthService.buildAccessToken produces.
 * Uses process.env.AUTH_TOKEN_SECRET (set to "test-secret" via .env.test).
 */
export function buildToken(userId: number, email: string): string {
  const secret = process.env.AUTH_TOKEN_SECRET ?? 'dev-sign-in-secret';
  const payload = `${userId}:${email}:${Date.now()}`;
  const payloadB64 = Buffer.from(payload).toString('base64url');
  const sig = createHmac('sha256', secret).update(payloadB64).digest('hex');
  return `${payloadB64}.${sig}`;
}

/**
 * Insert a user directly into the DB with the given role and return
 * the user record together with a valid auth token.
 * This avoids the bcrypt round-trip of the login endpoint for tests that only
 * need an authenticated caller, not the login flow itself.
 */
export async function createTestUser(
  prisma: PrismaService,
  overrides: {
    email?: string;
    role?: 'CITOYEN' | 'MODERATEUR' | 'ADMINISTRATEUR' | 'SUPER_ADMIN';
    prenom?: string;
    nom?: string;
  } = {},
): Promise<TestUser> {
  const email = overrides.email ?? `user-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`;
  const salt = await genSalt(10);
  const motDePasse = await hash(DEFAULT_PASSWORD, salt);

  const user = await prisma.utilisateur.create({
    data: {
      email,
      motDePasse,
      prenom: overrides.prenom ?? 'Test',
      nom: overrides.nom ?? 'User',
      role: (overrides.role ?? 'CITOYEN') as any,
    },
  });

  return {
    id: user.idUtilisateur,
    email: user.email,
    token: buildToken(user.idUtilisateur, user.email),
  };
}

/** Convenience wrappers */
export const createCitoyen = (prisma: PrismaService, email?: string) =>
  createTestUser(prisma, { email, role: 'CITOYEN' });

export const createModerateur = (prisma: PrismaService, email?: string) =>
  createTestUser(prisma, { email, role: 'MODERATEUR' });

export const createAdmin = (prisma: PrismaService, email?: string) =>
  createTestUser(prisma, { email, role: 'ADMINISTRATEUR' });

export const createSuperAdmin = (prisma: PrismaService, email?: string) =>
  createTestUser(prisma, { email, role: 'SUPER_ADMIN' });

/** Default plaintext password used by createTestUser. */
export { DEFAULT_PASSWORD };
