import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, truncateAll } from './helpers/e2e.helper';
import { PrismaService } from '../src/prisma/prisma.service';
import { createAdmin, createCitoyen } from './helpers/auth.helper';

describe('Categories (e2e)', () => {
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
    await prisma.categorie.deleteMany();
  });

  const http = () => request(app.getHttpServer());

  describe('GET /categories', () => {
    it('200 — retourne la liste (accessible a tous)', async () => {
      const user = await createCitoyen(prisma);
      await prisma.categorie.create({ data: { nom: 'Sport' } });
      const res = await http()
        .get('/categories')
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /categories/:id', () => {
    it('200 — retourne la categorie', async () => {
      const user = await createCitoyen(prisma);
      const cat = await prisma.categorie.create({ data: { nom: 'Sante' } });
      const res = await http()
        .get(`/categories/${cat.idCategorie}`)
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).toBe(200);
      expect(res.body.nom).toBe('Sante');
    });

    it('404 — categorie inexistante', async () => {
      const user = await createCitoyen(prisma);
      const res = await http()
        .get('/categories/99999')
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /categories', () => {
    it('201 — admin cree une categorie', async () => {
      const admin = await createAdmin(prisma);
      const res = await http()
        .post('/categories')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ nom: 'Famille' });
      expect(res.status).toBe(201);
      expect(res.body.nom).toBe('Famille');
    });

    it('403 — citoyen ne peut pas creer', async () => {
      const user = await createCitoyen(prisma);
      const res = await http()
        .post('/categories')
        .set('Authorization', `Bearer ${user.token}`)
        .send({ nom: 'Loisirs' });
      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /categories/:id', () => {
    it('200 — admin modifie une categorie', async () => {
      const admin = await createAdmin(prisma);
      const cat = await prisma.categorie.create({ data: { nom: 'Vieux nom' } });
      const res = await http()
        .patch(`/categories/${cat.idCategorie}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ nom: 'Nouveau nom' });
      expect(res.status).toBe(200);
      expect(res.body.nom).toBe('Nouveau nom');
    });
  });

  describe('DELETE /categories/:id', () => {
    it('200 — admin supprime une categorie', async () => {
      const admin = await createAdmin(prisma);
      const cat = await prisma.categorie.create({ data: { nom: 'A supprimer' } });
      const res = await http()
        .delete(`/categories/${cat.idCategorie}`)
        .set('Authorization', `Bearer ${admin.token}`);
      expect(res.status).toBe(200);
    });

    it('403 — citoyen ne peut pas supprimer', async () => {
      const user = await createCitoyen(prisma);
      const cat = await prisma.categorie.create({ data: { nom: 'A garder' } });
      const res = await http()
        .delete(`/categories/${cat.idCategorie}`)
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).toBe(403);
    });
  });
});
