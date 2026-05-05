import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { TagsService } from './tags.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  asPrismaService,
  createPrismaMock,
  type PrismaMock,
} from '../test-utils/prisma.mock';
import { resetFixtureIds } from '../test-utils/fixtures';

const makeTag = (overrides: any = {}) => ({
  idTag: 1,
  nom: 'sante',
  ...overrides,
});

describe('TagsService', () => {
  let service: TagsService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    resetFixtureIds();
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        { provide: PrismaService, useValue: asPrismaService(prisma) },
      ],
    }).compile();

    service = module.get<TagsService>(TagsService);
  });

  describe('findAll', () => {
    it('retourne tous les tags tries par nom', async () => {
      const tags = [makeTag({ nom: 'aide' }), makeTag({ nom: 'sante' })];
      prisma.tag.findMany.mockResolvedValue(tags);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(prisma.tag.findMany).toHaveBeenCalledWith({
        orderBy: { nom: 'asc' },
      });
    });
  });

  describe('findById', () => {
    it('retourne le tag si il existe', async () => {
      const tag = makeTag({ idTag: 5 });
      prisma.tag.findUnique.mockResolvedValue(tag);

      const result = await service.findById(5);

      expect(result.idTag).toBe(5);
    });

    it('leve NotFoundException si le tag est introuvable', async () => {
      prisma.tag.findUnique.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it("cree le tag si le nom n'existe pas deja", async () => {
      prisma.tag.findUnique.mockResolvedValue(null);
      const tag = makeTag({ nom: 'nouveau' });
      prisma.tag.create.mockResolvedValue(tag);

      const result = await service.create({ nom: 'nouveau' });

      expect(result.nom).toBe('nouveau');
    });

    it('leve ConflictException si le nom existe deja', async () => {
      prisma.tag.findUnique.mockResolvedValue(makeTag({ nom: 'sante' }));

      await expect(service.create({ nom: 'sante' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('supprime le tag si il existe', async () => {
      const tag = makeTag({ idTag: 1 });
      prisma.tag.findUnique.mockResolvedValue(tag);
      prisma.tag.delete.mockResolvedValue(tag);

      await service.remove(1);

      expect(prisma.tag.delete).toHaveBeenCalledWith({ where: { idTag: 1 } });
    });

    it("leve NotFoundException si le tag n'existe pas", async () => {
      prisma.tag.findUnique.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addToRessource', () => {
    it('cree une association ressource-tag', async () => {
      const link = { idRessource: 1, idTag: 2 };
      prisma.ressourceTag.create.mockResolvedValue(link);

      const result = await service.addToRessource(1, 2);

      expect(prisma.ressourceTag.create).toHaveBeenCalledWith({
        data: { idRessource: 1, idTag: 2 },
      });
      expect(result).toEqual(link);
    });
  });

  describe('removeFromRessource', () => {
    it("supprime l'association ressource-tag via la cle composite", async () => {
      prisma.ressourceTag.delete.mockResolvedValue({
        idRessource: 1,
        idTag: 2,
      });

      await service.removeFromRessource(1, 2);

      expect(prisma.ressourceTag.delete).toHaveBeenCalledWith({
        where: { idRessource_idTag: { idRessource: 1, idTag: 2 } },
      });
    });
  });
});
