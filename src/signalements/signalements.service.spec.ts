import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { SignalementsService } from './signalements.service';
import { PrismaService } from '../prisma/prisma.service';
import { asPrismaService, createPrismaMock, type PrismaMock } from '../test-utils/prisma.mock';
import { resetFixtureIds } from '../test-utils/fixtures';

const makeSignalement = (overrides: any = {}) => ({
  idSignalement: 1,
  idUtilisateur: 1,
  typeSignalement: 'RESSOURCE',
  idRessource: 1,
  idCommentaire: null,
  motif: 'Contenu inapproprie',
  dateCreation: new Date('2024-01-01'),
  statut: 'EN_ATTENTE',
  idModerateur: null,
  actionPrise: null,
  dateTraitement: null,
  ...overrides,
});

describe('SignalementsService', () => {
  let service: SignalementsService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    resetFixtureIds();
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignalementsService,
        { provide: PrismaService, useValue: asPrismaService(prisma) },
      ],
    }).compile();

    service = module.get<SignalementsService>(SignalementsService);
  });

  describe('findAll', () => {
    it("retourne tous les signalements sans filtre", async () => {
      prisma.signalement.findMany.mockResolvedValue([makeSignalement()]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(prisma.signalement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it("filtre par statut si fourni", async () => {
      prisma.signalement.findMany.mockResolvedValue([]);

      await service.findAll('TRAITE');

      expect(prisma.signalement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { statut: 'TRAITE' } }),
      );
    });
  });

  describe('findById', () => {
    it("retourne le signalement si il existe", async () => {
      const s = makeSignalement({ idSignalement: 2 });
      prisma.signalement.findUnique.mockResolvedValue(s);

      const result = await service.findById(2);

      expect(result.idSignalement).toBe(2);
    });

    it("leve NotFoundException si introuvable", async () => {
      prisma.signalement.findUnique.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it("cree un signalement de ressource", async () => {
      const s = makeSignalement();
      prisma.signalement.create.mockResolvedValue(s);

      const dto = { idUtilisateur: 1, typeSignalement: 'RESSOURCE', idRessource: 1, motif: 'Contenu inapproprie' };
      const result = await service.create(dto as any);

      expect(result.typeSignalement).toBe('RESSOURCE');
    });
  });

  describe('update', () => {
    it("traite le signalement et ajoute dateTraitement pour statut TRAITE", async () => {
      const s = makeSignalement({ idSignalement: 1 });
      prisma.signalement.findUnique.mockResolvedValue(s);
      const updated = { ...s, statut: 'TRAITE', dateTraitement: new Date() };
      prisma.signalement.update.mockResolvedValue(updated);

      await service.update(1, { statut: 'TRAITE', actionPrise: 'Suppression' } as any);

      const callData = prisma.signalement.update.mock.calls[0][0].data;
      expect(callData.dateTraitement).toBeInstanceOf(Date);
    });

    it("ne met pas dateTraitement si le statut reste EN_ATTENTE", async () => {
      const s = makeSignalement({ idSignalement: 1 });
      prisma.signalement.findUnique.mockResolvedValue(s);
      prisma.signalement.update.mockResolvedValue(s);

      await service.update(1, { statut: 'EN_ATTENTE' } as any);

      const callData = prisma.signalement.update.mock.calls[0][0].data;
      expect(callData.dateTraitement).toBeUndefined();
    });

    it("leve NotFoundException si le signalement n'existe pas", async () => {
      prisma.signalement.findUnique.mockResolvedValue(null);

      await expect(service.update(99, {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it("supprime le signalement si il existe", async () => {
      const s = makeSignalement({ idSignalement: 1 });
      prisma.signalement.findUnique.mockResolvedValue(s);
      prisma.signalement.delete.mockResolvedValue(s);

      await service.remove(1);

      expect(prisma.signalement.delete).toHaveBeenCalledWith({ where: { idSignalement: 1 } });
    });

    it("leve NotFoundException si il n'existe pas", async () => {
      prisma.signalement.findUnique.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
