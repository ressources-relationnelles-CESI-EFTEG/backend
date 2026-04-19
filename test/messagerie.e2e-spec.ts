import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, truncateAll } from './helpers/e2e.helper';
import { PrismaService } from '../src/prisma/prisma.service';
import { createCitoyen } from './helpers/auth.helper';

describe('Messagerie (e2e)', () => {
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

  describe('Parcours complet messagerie', () => {
    it('cree une conversation, envoie un message, marque lu, compte non-lus', async () => {
      const alice = await createCitoyen(prisma);
      const bob = await createCitoyen(prisma);

      // Creer conversation
      const convRes = await http()
        .post('/messagerie/conversations')
        .set('Authorization', `Bearer ${alice.token}`)
        .send({ participantIds: [alice.id, bob.id] });
      expect(convRes.status).toBe(201);
      const convId = convRes.body.idConversation;

      // Alice envoie un message
      const msgRes = await http()
        .post(`/messagerie/conversations/${convId}/messages`)
        .set('Authorization', `Bearer ${alice.token}`)
        .send({ contenu: 'Bonjour Bob !' });
      expect(msgRes.status).toBe(201);
      expect(msgRes.body.contenu).toBe('Bonjour Bob !');

      // Bob liste les messages
      const msgsRes = await http()
        .get(`/messagerie/conversations/${convId}/messages`)
        .set('Authorization', `Bearer ${bob.token}`);
      expect(msgsRes.status).toBe(200);
      expect(msgsRes.body.length).toBe(1);

      // Compter non-lus pour Bob (1 message non lu)
      const unreadRes = await http()
        .get(`/messagerie/non-lus/${bob.id}`)
        .set('Authorization', `Bearer ${bob.token}`);
      expect(unreadRes.status).toBe(200);
      expect(unreadRes.body.nonLus).toBe(1);

      // Bob marque comme lu
      const markRes = await http()
        .patch(`/messagerie/conversations/${convId}/lu/${bob.id}`)
        .set('Authorization', `Bearer ${bob.token}`);
      expect(markRes.status).toBe(200);

      // Non-lus => 0
      const unreadAfterRes = await http()
        .get(`/messagerie/non-lus/${bob.id}`)
        .set('Authorization', `Bearer ${bob.token}`);
      expect(unreadAfterRes.body.nonLus).toBe(0);
    });
  });

  describe('GET /messagerie/conversations/utilisateur/:id', () => {
    it("200 — retourne les conversations de l'utilisateur", async () => {
      const alice = await createCitoyen(prisma);
      const bob = await createCitoyen(prisma);
      await prisma.conversation.create({
        data: {
          participants: {
            create: [{ idUtilisateur: alice.id }, { idUtilisateur: bob.id }],
          },
        },
      });

      const res = await http()
        .get(`/messagerie/conversations/utilisateur/${alice.id}`)
        .set('Authorization', `Bearer ${alice.token}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /messagerie/conversations/:id', () => {
    it('404 — conversation inexistante', async () => {
      const user = await createCitoyen(prisma);
      const res = await http()
        .get('/messagerie/conversations/99999')
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).toBe(404);
    });
  });
});
