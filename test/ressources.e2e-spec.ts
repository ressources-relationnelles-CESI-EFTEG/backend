import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, truncateAll } from './helpers/e2e.helper';
import { PrismaService } from '../src/prisma/prisma.service';
import { createCitoyen, createModerateur } from './helpers/auth.helper';

describe('Ressources (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let categorieId: number;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
    await truncateAll(prisma);
    // Seed une categorie necessaire pour creer des ressources
    const cat = await prisma.categorie.create({ data: { nom: 'Sante' } });
    categorieId = cat.idCategorie;
  });

  afterAll(async () => {
    await truncateAll(prisma);
    await app.close();
  });

  beforeEach(async () => {
    await prisma.ressource.deleteMany();
  });

  const http = () => request(app.getHttpServer());

  const ressourcePayload = (userId: number) => ({
    titre: 'Test ressource',
    description: 'Description',
    contenu: 'Contenu de test',
    typeRessource: 'ARTICLE',
    visibilite: 'PUBLIQUE',
    idUtilisateur: userId,
    idCategorie: categorieId,
  });

  // ─── GET /ressources ──────────────────────────────────────────────────────

  describe('GET /ressources', () => {
    it('200 — retourne la liste publique sans token', async () => {
      const user = await createCitoyen(prisma);
      await prisma.ressource.create({
        data: {
          ...ressourcePayload(user.id),
          visibilite: 'PUBLIQUE',
          statut: 'VALIDEE',
        } as any,
      });

      const res = await http()
        .get('/ressources')
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('200 — filtre par categorie via ?categorie=', async () => {
      const user = await createCitoyen(prisma);
      const res = await http()
        .get(`/ressources?categorie=${categorieId}`)
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).toBe(200);
    });
  });

  // ─── GET /ressources/:id ──────────────────────────────────────────────────

  describe('GET /ressources/:id', () => {
    it('200 — retourne la ressource', async () => {
      const user = await createCitoyen(prisma);
      const r = await prisma.ressource.create({
        data: ressourcePayload(user.id) as any,
      });

      const res = await http()
        .get(`/ressources/${r.idRessource}`)
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).toBe(200);
      expect(res.body.idRessource).toBe(r.idRessource);
    });

    it('404 — ressource inexistante', async () => {
      const user = await createCitoyen(prisma);
      const res = await http()
        .get('/ressources/99999')
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).toBe(404);
    });
  });

  // ─── GET /ressources/utilisateur/:id ─────────────────────────────────────

  describe('GET /ressources/utilisateur/:id', () => {
    it("200 — retourne les ressources de l'utilisateur", async () => {
      const user = await createCitoyen(prisma);
      await prisma.ressource.create({ data: ressourcePayload(user.id) as any });

      const res = await http()
        .get(`/ressources/utilisateur/${user.id}`)
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── POST /ressources ─────────────────────────────────────────────────────

  describe('POST /ressources', () => {
    it('201 — cree une ressource', async () => {
      const user = await createCitoyen(prisma);
      const res = await http()
        .post('/ressources')
        .set('Authorization', `Bearer ${user.token}`)
        .send(ressourcePayload(user.id));
      expect(res.status).toBe(201);
      expect(res.body.titre).toBe('Test ressource');
    });

    it('401 — creation sans token refusee', async () => {
      const user = await createCitoyen(prisma);
      const res = await http()
        .post('/ressources')
        .send(ressourcePayload(user.id));
      expect(res.status).toBe(401);
    });
  });

  // ─── PATCH /ressources/:id ────────────────────────────────────────────────

  describe('PATCH /ressources/:id', () => {
    it('200 — modification par un moderateur', async () => {
      const user = await createCitoyen(prisma);
      const mod = await createModerateur(prisma);
      const r = await prisma.ressource.create({
        data: ressourcePayload(user.id) as any,
      });

      const res = await http()
        .patch(`/ressources/${r.idRessource}`)
        .set('Authorization', `Bearer ${mod.token}`)
        .send({ titre: 'Titre modifie' });
      expect(res.status).toBe(200);
      expect(res.body.titre).toBe('Titre modifie');
    });

    it('403 — modification refusee pour un CITOYEN', async () => {
      const user = await createCitoyen(prisma);
      const r = await prisma.ressource.create({
        data: ressourcePayload(user.id) as any,
      });

      const res = await http()
        .patch(`/ressources/${r.idRessource}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ titre: 'Titre' });
      expect(res.status).toBe(403);
    });
  });

  // ─── DELETE /ressources/:id ───────────────────────────────────────────────

  describe('DELETE /ressources/:id', () => {
    it('200 — suppression par un moderateur', async () => {
      const user = await createCitoyen(prisma);
      const mod = await createModerateur(prisma);
      const r = await prisma.ressource.create({
        data: ressourcePayload(user.id) as any,
      });

      const res = await http()
        .delete(`/ressources/${r.idRessource}`)
        .set('Authorization', `Bearer ${mod.token}`);
      expect(res.status).toBe(200);
    });

    it('403 — suppression refusee pour un CITOYEN', async () => {
      const user = await createCitoyen(prisma);
      const r = await prisma.ressource.create({
        data: ressourcePayload(user.id) as any,
      });

      const res = await http()
        .delete(`/ressources/${r.idRessource}`)
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).toBe(403);
    });
  });
});
