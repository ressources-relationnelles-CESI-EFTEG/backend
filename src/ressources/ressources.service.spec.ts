import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { RessourcesService } from './ressources.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  asPrismaService,
  createPrismaMock,
  type PrismaMock,
} from '../test-utils/prisma.mock';
import { makeRessource, resetFixtureIds } from '../test-utils/fixtures';

describe('RessourcesService', () => {
  let service: RessourcesService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    resetFixtureIds();
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RessourcesService,
        { provide: PrismaService, useValue: asPrismaService(prisma) },
      ],
    }).compile();

    service = module.get<RessourcesService>(RessourcesService);
  });

  // ─── findAll ─────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('retourne uniquement les ressources VALIDEE et PUBLIQUE', async () => {
      const r = makeRessource();
      prisma.ressource.findMany.mockResolvedValue([r]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(prisma.ressource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            statut: 'VALIDEE',
            visibilite: 'PUBLIQUE',
          }),
        }),
      );
    });

    it('filtre par categorieId quand fourni', async () => {
      prisma.ressource.findMany.mockResolvedValue([]);

      await service.findAll(3);

      expect(prisma.ressource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ idCategorie: 3 }),
        }),
      );
    });

    it('ne filtre pas par categorie quand absent', async () => {
      prisma.ressource.findMany.mockResolvedValue([]);

      await service.findAll();

      const call = prisma.ressource.findMany.mock.calls[0][0];
      expect(call.where).not.toHaveProperty('idCategorie');
    });
  });

  // ─── findById ────────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('retourne la ressource si elle existe', async () => {
      const r = makeRessource({ idRessource: 5 });
      prisma.ressource.findUnique.mockResolvedValue(r);

      const result = await service.findById(5);

      expect(result.idRessource).toBe(5);
    });

    it('leve NotFoundException si la ressource est introuvable', async () => {
      prisma.ressource.findUnique.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findByUtilisateur ───────────────────────────────────────────────────────

  describe('findByUtilisateur', () => {
    it("retourne toutes les ressources de l'utilisateur", async () => {
      const r1 = makeRessource({ idUtilisateur: 2 });
      const r2 = makeRessource({ idUtilisateur: 2 });
      prisma.ressource.findMany.mockResolvedValue([r1, r2]);

      const result = await service.findByUtilisateur(2);

      expect(result).toHaveLength(2);
      expect(prisma.ressource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { idUtilisateur: 2 } }),
      );
    });
  });

  // ─── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('cree une ressource et la retourne', async () => {
      const r = makeRessource({ titre: 'Nouvelle ressource' });
      prisma.ressource.create.mockResolvedValue(r);

      const dto = {
        titre: 'Nouvelle ressource',
        contenu: 'Contenu',
        idCategorie: 1,
        idUtilisateur: 1,
      };
      const result = await service.create(dto as any);

      expect(result.titre).toBe('Nouvelle ressource');
      expect(prisma.ressource.create).toHaveBeenCalledTimes(1);
    });
  });

  // ─── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('met a jour la ressource si elle existe', async () => {
      const r = makeRessource({ idRessource: 1 });
      prisma.ressource.findUnique.mockResolvedValue(r);
      const updated = { ...r, titre: 'Titre modifie' };
      prisma.ressource.update.mockResolvedValue(updated);

      prisma.utilisateur.findUnique.mockResolvedValue({ role: 'CITOYEN' });

      const result = await service.update(
        1,
        { titre: 'Titre modifie' } as any,
        1,
      );

      expect(result.titre).toBe('Titre modifie');
      expect(prisma.ressource.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { idRessource: 1 },
          data: expect.objectContaining({
            titre: 'Titre modifie',
            dateModification: expect.any(Date),
          }),
        }),
      );
    });

    it("leve NotFoundException si la ressource n'existe pas", async () => {
      prisma.ressource.findUnique.mockResolvedValue(null);

      await expect(service.update(99, {} as any, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── remove ──────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('supprime la ressource si elle existe', async () => {
      const r = makeRessource({ idRessource: 1 });
      prisma.ressource.findUnique.mockResolvedValue(r);
      prisma.ressource.delete.mockResolvedValue(r);
      prisma.signalement.deleteMany.mockResolvedValue({ count: 0 });

      await service.remove(1, 1);

      expect(prisma.ressource.delete).toHaveBeenCalledWith({
        where: { idRessource: 1 },
      });
    });

    it("leve NotFoundException si la ressource n'existe pas", async () => {
      prisma.ressource.findUnique.mockResolvedValue(null);

      await expect(service.remove(99, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
