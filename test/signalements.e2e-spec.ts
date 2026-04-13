import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, truncateAll } from './helpers/e2e.helper';
import { PrismaService } from '../src/prisma/prisma.service';
import { createCitoyen, createModerateur } from './helpers/auth.helper';

describe('Signalements (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let categorieId: number;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
    await truncateAll(prisma);
    const cat = await prisma.categorie.create({ data: { nom: 'Cat test' } });
    categorieId = cat.idCategorie;
  });

  afterAll(async () => {
    await truncateAll(prisma);
    await app.close();
  });

  beforeEach(async () => {
    await prisma.signalement.deleteMany();
    await prisma.ressource.deleteMany();
  });

  const http = () => request(app.getHttpServer());

  describe('POST /signalements', () => {
    it('201 — citoyen signale une ressource', async () => {
      const user = await createCitoyen(prisma);
      const r = await prisma.ressource.create({
        data: {
          titre: 'Ressource signalable',
          contenu: 'Contenu',
          idUtilisateur: user.id,
          idCategorie: categorieId,
          statut: 'VALIDEE',
          visibilite: 'PUBLIQUE',
        } as any,
      });

      const res = await http()
        .post('/signalements')
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          idUtilisateur: user.id,
          typeSignalement: 'RESSOURCE',
          idRessource: r.idRessource,
          motif: 'Contenu inapproprie',
        });
      expect(res.status).toBe(201);
      expect(res.body.statut).toBe('EN_ATTENTE');
    });
  });

  describe('GET /signalements', () => {
    it('200 — moderateur voit les signalements', async () => {
      const mod = await createModerateur(prisma);
      const res = await http()
        .get('/signalements')
        .set('Authorization', `Bearer ${mod.token}`);
      expect(res.status).toBe(200);
    });

    it('403 — citoyen ne peut pas voir les signalements', async () => {
      const user = await createCitoyen(prisma);
      const res = await http()
        .get('/signalements')
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).toBe(403);
    });

    it('200 — filtre par statut', async () => {
      const mod = await createModerateur(prisma);
      const res = await http()
        .get('/signalements?statut=EN_ATTENTE')
        .set('Authorization', `Bearer ${mod.token}`);
      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /signalements/:id (traitement)', () => {
    it('200 — moderateur traite un signalement', async () => {
      const user = await createCitoyen(prisma);
      const mod = await createModerateur(prisma);
      const r = await prisma.ressource.create({
        data: {
          titre: 'Ressource',
          contenu: 'Contenu',
          idUtilisateur: user.id,
          idCategorie: categorieId,
          statut: 'VALIDEE',
          visibilite: 'PUBLIQUE',
        } as any,
      });
      const signalement = await prisma.signalement.create({
        data: {
          idUtilisateur: user.id,
          typeSignalement: 'RESSOURCE',
          idRessource: r.idRessource,
          motif: 'Motif test',
        } as any,
      });

      const res = await http()
        .patch(`/signalements/${signalement.idSignalement}`)
        .set('Authorization', `Bearer ${mod.token}`)
        .send({ statut: 'TRAITE', actionPrise: 'Avertissement envoye' });
      expect(res.status).toBe(200);
      expect(res.body.statut).toBe('TRAITE');
      expect(res.body.dateTraitement).toBeDefined();
    });
  });
});
