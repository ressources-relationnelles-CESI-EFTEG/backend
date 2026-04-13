import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, truncateAll } from './helpers/e2e.helper';
import { PrismaService } from '../src/prisma/prisma.service';
import { createAdmin, createCitoyen } from './helpers/auth.helper';

describe('Utilisateurs (e2e)', () => {
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

  // ─── GET /utilisateurs ────────────────────────────────────────────────────

  describe('GET /utilisateurs', () => {
    it('200 — retourne la liste pour un admin', async () => {
      const admin = await createAdmin(prisma);
      const res = await http()
        .get('/utilisateurs')
        .set('Authorization', `Bearer ${admin.token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('403 — refuse pour un CITOYEN', async () => {
      const user = await createCitoyen(prisma);
      const res = await http()
        .get('/utilisateurs')
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).toBe(403);
    });

    it('200 — filtre par search', async () => {
      const admin = await createAdmin(prisma);
      await createCitoyen(prisma, 'alice-search@example.com');
      const res = await http()
        .get('/utilisateurs?search=alice-search')
        .set('Authorization', `Bearer ${admin.token}`);
      expect(res.status).toBe(200);
    });
  });

  // ─── GET /utilisateurs/:id ────────────────────────────────────────────────

  describe('GET /utilisateurs/:id', () => {
    it("200 — retourne l'utilisateur sans motDePasse", async () => {
      const user = await createCitoyen(prisma);
      const res = await http()
        .get(`/utilisateurs/${user.id}`)
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).toBe(200);
      expect(res.body.idUtilisateur).toBe(user.id);
      expect(res.body.motDePasse).toBeUndefined();
    });

    it('404 — utilisateur inexistant', async () => {
      const user = await createCitoyen(prisma);
      const res = await http()
        .get('/utilisateurs/99999')
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).toBe(404);
    });
  });

  // ─── PATCH /utilisateurs/:id ──────────────────────────────────────────────

  describe('PATCH /utilisateurs/:id', () => {
    it('200 — met a jour les donnees', async () => {
      const user = await createCitoyen(prisma);
      const res = await http()
        .patch(`/utilisateurs/${user.id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ prenom: 'Nouveau' });
      expect(res.status).toBe(200);
      expect(res.body.prenom).toBe('Nouveau');
    });

    it('404 — utilisateur inexistant', async () => {
      const user = await createCitoyen(prisma);
      const res = await http()
        .patch('/utilisateurs/99999')
        .set('Authorization', `Bearer ${user.token}`)
        .send({ prenom: 'X' });
      expect(res.status).toBe(404);
    });
  });

  // ─── PATCH /utilisateurs/:id/statut ──────────────────────────────────────

  describe('PATCH /utilisateurs/:id/statut', () => {
    it('200 — admin change le statut', async () => {
      const admin = await createAdmin(prisma);
      const user = await createCitoyen(prisma);
      const res = await http()
        .patch(`/utilisateurs/${user.id}/statut`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ statut: 'SUSPENDU' });
      expect(res.status).toBe(200);
      expect(res.body.statut).toBe('SUSPENDU');
    });

    it('403 — citoyen ne peut pas changer le statut', async () => {
      const user = await createCitoyen(prisma);
      const target = await createCitoyen(prisma);
      const res = await http()
        .patch(`/utilisateurs/${target.id}/statut`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ statut: 'SUSPENDU' });
      expect(res.status).toBe(403);
    });
  });

  // ─── PATCH /utilisateurs/:id/role ────────────────────────────────────────

  describe('PATCH /utilisateurs/:id/role', () => {
    it('200 — admin change le role', async () => {
      const admin = await createAdmin(prisma);
      const user = await createCitoyen(prisma);
      const res = await http()
        .patch(`/utilisateurs/${user.id}/role`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ role: 'MODERATEUR' });
      expect(res.status).toBe(200);
      expect(res.body.role).toBe('MODERATEUR');
    });
  });

  // ─── DELETE /utilisateurs/:id ─────────────────────────────────────────────

  describe('DELETE /utilisateurs/:id', () => {
    it('200 — admin supprime un utilisateur', async () => {
      const admin = await createAdmin(prisma);
      const user = await createCitoyen(prisma);
      const res = await http()
        .delete(`/utilisateurs/${user.id}`)
        .set('Authorization', `Bearer ${admin.token}`);
      expect(res.status).toBe(200);
    });

    it('403 — citoyen ne peut pas supprimer', async () => {
      const user = await createCitoyen(prisma);
      const target = await createCitoyen(prisma);
      const res = await http()
        .delete(`/utilisateurs/${target.id}`)
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).toBe(403);
    });
  });
});
