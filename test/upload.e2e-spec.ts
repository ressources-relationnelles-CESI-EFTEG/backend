import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { createTestApp, truncateAll } from './helpers/e2e.helper';
import { PrismaService } from '../src/prisma/prisma.service';
import { createCitoyen } from './helpers/auth.helper';

describe('Upload photo profil (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
    // S'assurer que le dossier uploads existe
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });
  });

  afterAll(async () => {
    await truncateAll(prisma);
    await app.close();
  });

  beforeEach(async () => {
    await truncateAll(prisma);
  });

  const http = () => request(app.getHttpServer());

  describe('POST /utilisateurs/:id/photo', () => {
    it('200 — upload une image et met a jour photoProfil', async () => {
      const user = await createCitoyen(prisma);

      // Cree un faux fichier PNG en memoire (1x1 pixel PNG minimal)
      const pngBuffer = Buffer.from(
        '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a4944415478016360000000020001e221bc330000000049454e44ae426082',
        'hex',
      );

      const res = await http()
        .post(`/utilisateurs/${user.id}/photo`)
        .set('Authorization', `Bearer ${user.token}`)
        .attach('photo', pngBuffer, {
          filename: 'test.png',
          contentType: 'image/png',
        });

      expect(res.status).toBe(201);
      expect(res.body.photoProfil).toMatch(/^\/uploads\/photo-/);
    });

    it('400 — fichier non-image refuse', async () => {
      const user = await createCitoyen(prisma);
      const txtBuffer = Buffer.from('ceci est un fichier texte');

      const res = await http()
        .post(`/utilisateurs/${user.id}/photo`)
        .set('Authorization', `Bearer ${user.token}`)
        .attach('photo', txtBuffer, {
          filename: 'test.txt',
          contentType: 'text/plain',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /utilisateurs/:id/photo', () => {
    it('200 — supprime la photo et met photoProfil a null', async () => {
      const user = await createCitoyen(prisma);

      // Cree un faux fichier dans uploads
      const fakeFile = join(
        process.cwd(),
        'uploads',
        `photo-fake-${Date.now()}.png`,
      );
      writeFileSync(fakeFile, 'fake image');
      await prisma.utilisateur.update({
        where: { idUtilisateur: user.id },
        data: { photoProfil: `/uploads/${fakeFile.split('/').pop()}` },
      });

      const res = await http()
        .delete(`/utilisateurs/${user.id}/photo`)
        .set('Authorization', `Bearer ${user.token}`);

      expect(res.status).toBe(200);
      expect(res.body.photoProfil).toBeNull();
    });
  });
});
