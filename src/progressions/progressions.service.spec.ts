import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { ProgressionsService } from './progressions.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  asPrismaService,
  createPrismaMock,
  type PrismaMock,
} from '../test-utils/prisma.mock';
import { resetFixtureIds } from '../test-utils/fixtures';

const makeProgression = (overrides: any = {}) => ({
  idProgression: 1,
  idUtilisateur: 1,
  idRessource: 1,
  typeProgression: 'EXPLOITEE',
  dateAjout: new Date('2024-01-01'),
  rappelJours: null,
  ...overrides,
});

describe('ProgressionsService', () => {
  let service: ProgressionsService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    resetFixtureIds();
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressionsService,
        { provide: PrismaService, useValue: asPrismaService(prisma) },
      ],
    }).compile();

    service = module.get<ProgressionsService>(ProgressionsService);
  });

  describe('findByUtilisateur', () => {
    it("retourne les progressions de l'utilisateur", async () => {
      prisma.progression.findMany.mockResolvedValue([makeProgression()]);

      const result = await service.findByUtilisateur(1);

      expect(result).toHaveLength(1);
      expect(prisma.progression.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { idUtilisateur: 1 } }),
      );
    });

    it('filtre par type de progression si fourni', async () => {
      prisma.progression.findMany.mockResolvedValue([]);

      await service.findByUtilisateur(1, 'MISE_DE_COTE');

      const call = prisma.progression.findMany.mock.calls[0][0];
      expect(call.where.typeProgression).toBe('MISE_DE_COTE');
    });
  });

  describe('findById', () => {
    it('retourne la progression si elle existe', async () => {
      const p = makeProgression({ idProgression: 5 });
      prisma.progression.findUnique.mockResolvedValue(p);

      const result = await service.findById(5);

      expect(result.idProgression).toBe(5);
    });

    it('leve NotFoundException si introuvable', async () => {
      prisma.progression.findUnique.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('cree une progression et la retourne', async () => {
      const p = makeProgression();
      prisma.progression.create.mockResolvedValue(p);

      const dto = {
        idUtilisateur: 1,
        idRessource: 1,
        typeProgression: 'EXPLOITEE',
      };
      const result = await service.create(dto as any);

      expect(result.typeProgression).toBe('EXPLOITEE');
    });
  });

  describe('update', () => {
    it('met a jour la progression si elle existe', async () => {
      const p = makeProgression({ idProgression: 1 });
      prisma.progression.findUnique.mockResolvedValue(p);
      const updated = { ...p, rappelJours: 7 };
      prisma.progression.update.mockResolvedValue(updated);

      const result = await service.update(1, { rappelJours: 7 } as any);

      expect(result.rappelJours).toBe(7);
    });

    it("leve NotFoundException si elle n'existe pas", async () => {
      prisma.progression.findUnique.mockResolvedValue(null);

      await expect(service.update(99, {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('supprime la progression si elle existe', async () => {
      const p = makeProgression({ idProgression: 1 });
      prisma.progression.findUnique.mockResolvedValue(p);
      prisma.progression.delete.mockResolvedValue(p);

      await service.remove(1);

      expect(prisma.progression.delete).toHaveBeenCalledWith({
        where: { idProgression: 1 },
      });
    });

    it("leve NotFoundException si elle n'existe pas", async () => {
      prisma.progression.findUnique.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
