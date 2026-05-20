import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, truncateAll } from './helpers/e2e.helper';
import { PrismaService } from '../src/prisma/prisma.service';
import { createCitoyen, createSuperAdmin } from './helpers/auth.helper';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
  });

  afterAll(async () => {
    await truncateAll(prisma);
    await app.close();
  });

  beforeEach(async () => {
    await truncateAll(prisma);
  });

  const http = () => request(app.getHttpServer());

  // ─── POST /auth/register ──────────────────────────────────────────────────

  describe('POST /auth/register', () => {
    const payload = {
      firstname: 'Jean',
      lastname: 'Dupont',
      email: 'jean@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    it('201 — cree un compte et retourne un message', async () => {
      const res = await http().post('/auth/register').send(payload);
      expect(res.status).toBe(201);
      expect(res.body.message).toBeDefined();
      expect(res.body.user.email).toBe('jean@example.com');
    });

    it('409 — email deja utilise', async () => {
      await http().post('/auth/register').send(payload);
      const res = await http().post('/auth/register').send(payload);
      expect(res.status).toBe(409);
    });

    it('400 — mots de passe differents', async () => {
      const res = await http()
        .post('/auth/register')
        .send({ ...payload, confirmPassword: 'different' });
      expect(res.status).toBe(400);
    });

    it('400 — mot de passe trop court', async () => {
      const res = await http()
        .post('/auth/register')
        .send({ ...payload, password: 'short', confirmPassword: 'short' });
      expect(res.status).toBe(400);
    });

    it('400 — corps invalide (champ manquant)', async () => {
      const res = await http()
        .post('/auth/register')
        .send({ email: 'a@b.com', password: 'password123' });
      expect(res.status).toBe(400);
    });
  });

  // ─── POST /auth/login ─────────────────────────────────────────────────────

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await http().post('/auth/register').send({
        firstname: 'Alice',
        lastname: 'A',
        email: 'alice@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
    });

    it('200 — retourne accessToken et refreshToken', async () => {
      const res = await http()
        .post('/auth/login')
        .send({ email: 'alice@example.com', password: 'password123' });
      expect(res.status).toBe(201);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('401 — mauvais mot de passe', async () => {
      const res = await http()
        .post('/auth/login')
        .send({ email: 'alice@example.com', password: 'wrong' });
      expect(res.status).toBe(401);
    });

    it('401 — email inconnu', async () => {
      const res = await http()
        .post('/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' });
      expect(res.status).toBe(401);
    });
  });

  // ─── Auth guard ───────────────────────────────────────────────────────────

  describe('AuthGuard', () => {
    it('401 — acces route protegee sans token', async () => {
      const res = await http().get('/utilisateurs/1');
      expect(res.status).toBe(401);
    });

    it('401 — token invalide', async () => {
      const res = await http()
        .get('/utilisateurs/1')
        .set('Authorization', 'Bearer invalid.token');
      expect(res.status).toBe(401);
    });

    it('200 (ou 404) — token valide donne acces a une route protegee', async () => {
      const user = await createCitoyen(prisma);
      const res = await http()
        .get(`/utilisateurs/${user.id}`)
        .set('Authorization', `Bearer ${user.token}`);
      expect([200, 404]).toContain(res.status);
    });
  });

  // ─── POST /auth/create-admin ─────────────────────────────────────────────

  describe('POST /auth/create-admin', () => {
    it('403 — refuse pour un CITOYEN', async () => {
      const user = await createCitoyen(prisma);
      const res = await http()
        .post('/auth/create-admin')
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          firstname: 'Admin',
          lastname: 'Test',
          email: 'admin@example.com',
          password: 'adminpass',
          confirmPassword: 'adminpass',
        });
      expect(res.status).toBe(403);
    });

    it('201 — cree un admin pour SUPER_ADMIN', async () => {
      const superAdmin = await createSuperAdmin(prisma);
      const res = await http()
        .post('/auth/create-admin')
        .set('Authorization', `Bearer ${superAdmin.token}`)
        .send({
          firstname: 'Admin',
          lastname: 'Test',
          email: 'newadmin@example.com',
          password: 'adminpass1',
          confirmPassword: 'adminpass1',
        });
      expect(res.status).toBe(201);
    });
  });
});
