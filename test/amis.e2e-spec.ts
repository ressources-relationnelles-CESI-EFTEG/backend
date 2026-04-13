import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, truncateAll } from './helpers/e2e.helper';
import { PrismaService } from '../src/prisma/prisma.service';
import { createCitoyen } from './helpers/auth.helper';

describe('Amis (e2e)', () => {
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

  describe("Parcours complet demande d'amitie", () => {
    it('envoie, accepte, liste, supprime', async () => {
      const alice = await createCitoyen(prisma);
      const bob = await createCitoyen(prisma);

      // Alice envoie une demande a Bob
      const sendRes = await http()
        .post(`/amis/${alice.id}/${bob.id}`)
        .set('Authorization', `Bearer ${alice.token}`);
      expect(sendRes.status).toBe(201);
      expect(sendRes.body.statut).toBe('EN_ATTENTE');

      // Bob voit la demande recue
      const recuesRes = await http()
        .get(`/amis/demandes/recues/${bob.id}`)
        .set('Authorization', `Bearer ${bob.token}`);
      expect(recuesRes.status).toBe(200);
      expect(recuesRes.body.length).toBe(1);

      // Alice voit la demande envoyee
      const envoyeesRes = await http()
        .get(`/amis/demandes/envoyees/${alice.id}`)
        .set('Authorization', `Bearer ${alice.token}`);
      expect(envoyeesRes.status).toBe(200);
      expect(envoyeesRes.body.length).toBe(1);

      // Bob accepte
      const acceptRes = await http()
        .patch(`/amis/accepter/${alice.id}/${bob.id}`)
        .set('Authorization', `Bearer ${bob.token}`);
      expect(acceptRes.status).toBe(200);
      expect(acceptRes.body.statut).toBe('ACCEPTE');

      // Alice voit Bob dans sa liste d\'amis
      const amisRes = await http()
        .get(`/amis/utilisateur/${alice.id}`)
        .set('Authorization', `Bearer ${alice.token}`);
      expect(amisRes.status).toBe(200);
      expect(amisRes.body.length).toBe(1);

      // Alice supprime Bob
      const suppRes = await http()
        .delete(`/amis/${alice.id}/${bob.id}`)
        .set('Authorization', `Bearer ${alice.token}`);
      expect(suppRes.status).toBe(200);

      // Liste vide
      const afterRes = await http()
        .get(`/amis/utilisateur/${alice.id}`)
        .set('Authorization', `Bearer ${alice.token}`);
      expect(afterRes.body.length).toBe(0);
    });
  });

  describe('Demande refusee', () => {
    it('envoie et refuse une demande', async () => {
      const alice = await createCitoyen(prisma);
      const bob = await createCitoyen(prisma);

      await http()
        .post(`/amis/${alice.id}/${bob.id}`)
        .set('Authorization', `Bearer ${alice.token}`);

      const refuseRes = await http()
        .patch(`/amis/refuser/${alice.id}/${bob.id}`)
        .set('Authorization', `Bearer ${bob.token}`);
      expect(refuseRes.status).toBe(200);
      expect(refuseRes.body.statut).toBe('REFUSE');
    });
  });

  describe('Double demande', () => {
    it('409 — envoyer deux fois la meme demande', async () => {
      const alice = await createCitoyen(prisma);
      const bob = await createCitoyen(prisma);

      await http()
        .post(`/amis/${alice.id}/${bob.id}`)
        .set('Authorization', `Bearer ${alice.token}`);

      const res = await http()
        .post(`/amis/${alice.id}/${bob.id}`)
        .set('Authorization', `Bearer ${alice.token}`);
      expect(res.status).toBe(409);
    });
  });
});
