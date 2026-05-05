import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  asPrismaService,
  createPrismaMock,
  type PrismaMock,
} from '../test-utils/prisma.mock';
import { makeCategorie, resetFixtureIds } from '../test-utils/fixtures';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    resetFixtureIds();
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: asPrismaService(prisma) },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  describe('findAll', () => {
    it('retourne toutes les categories avec leurs enfants', async () => {
      const cats = [makeCategorie(), makeCategorie()];
      prisma.categorie.findMany.mockResolvedValue(cats);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(prisma.categorie.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ include: { enfants: true } }),
      );
    });
  });

  describe('findById', () => {
    it('retourne la categorie si elle existe', async () => {
      const cat = makeCategorie({ idCategorie: 1 });
      prisma.categorie.findUnique.mockResolvedValue(cat);

      const result = await service.findById(1);

      expect(result.idCategorie).toBe(1);
    });

    it('leve NotFoundException si la categorie est introuvable', async () => {
      prisma.categorie.findUnique.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('cree une categorie et la retourne', async () => {
      const cat = makeCategorie({ nom: 'Sante' });
      prisma.categorie.create.mockResolvedValue(cat);

      const result = await service.create({ nom: 'Sante' });

      expect(result.nom).toBe('Sante');
    });
  });

  describe('update', () => {
    it('met a jour la categorie si elle existe', async () => {
      const cat = makeCategorie({ idCategorie: 1 });
      prisma.categorie.findUnique.mockResolvedValue(cat);
      const updated = { ...cat, nom: 'Sport' };
      prisma.categorie.update.mockResolvedValue(updated);

      const result = await service.update(1, { nom: 'Sport' });

      expect(result.nom).toBe('Sport');
    });

    it("leve NotFoundException si la categorie n'existe pas", async () => {
      prisma.categorie.findUnique.mockResolvedValue(null);

      await expect(service.update(99, { nom: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('supprime la categorie si elle existe', async () => {
      const cat = makeCategorie({ idCategorie: 1 });
      prisma.categorie.findUnique.mockResolvedValue(cat);
      prisma.categorie.delete.mockResolvedValue(cat);

      await service.remove(1);

      expect(prisma.categorie.delete).toHaveBeenCalledWith({
        where: { idCategorie: 1 },
      });
    });

    it("leve NotFoundException si la categorie n'existe pas", async () => {
      prisma.categorie.findUnique.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
