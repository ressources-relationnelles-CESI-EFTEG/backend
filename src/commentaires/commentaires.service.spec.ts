import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { CommentairesService } from './commentaires.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  asPrismaService,
  createPrismaMock,
  type PrismaMock,
} from '../test-utils/prisma.mock';
import { resetFixtureIds } from '../test-utils/fixtures';

const makeCommentaire = (overrides: any = {}) => ({
  idCommentaire: 1,
  idUtilisateur: 1,
  idRessource: 1,
  idCommentaireParent: null,
  contenu: 'Super ressource !',
  dateCreation: new Date('2024-01-01'),
  dateModification: null,
  statut: 'VISIBLE',
  ...overrides,
});

describe('CommentairesService', () => {
  let service: CommentairesService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    resetFixtureIds();
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentairesService,
        { provide: PrismaService, useValue: asPrismaService(prisma) },
      ],
    }).compile();

    service = module.get<CommentairesService>(CommentairesService);
  });

  describe('findByRessource', () => {
    it('retourne uniquement les commentaires visibles sans parent', async () => {
      const comments = [makeCommentaire()];
      prisma.commentaire.findMany.mockResolvedValue(comments);

      const result = await service.findByRessource(1);

      expect(result).toHaveLength(1);
      expect(prisma.commentaire.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            idRessource: 1,
            idCommentaireParent: null,
            statut: 'VISIBLE',
          },
        }),
      );
    });
  });

  describe('findById', () => {
    it('retourne le commentaire si il existe', async () => {
      const c = makeCommentaire({ idCommentaire: 3 });
      prisma.commentaire.findUnique.mockResolvedValue(c);

      const result = await service.findById(3);

      expect(result.idCommentaire).toBe(3);
    });

    it('leve NotFoundException si le commentaire est introuvable', async () => {
      prisma.commentaire.findUnique.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('cree un commentaire et le retourne', async () => {
      const c = makeCommentaire({ contenu: 'Nouveau commentaire' });
      prisma.commentaire.create.mockResolvedValue(c);

      const dto = {
        idUtilisateur: 1,
        idRessource: 1,
        contenu: 'Nouveau commentaire',
      };
      const result = await service.create(dto as any);

      expect(result.contenu).toBe('Nouveau commentaire');
    });
  });

  describe('update', () => {
    it('met a jour le contenu et ajoute dateModification', async () => {
      const c = makeCommentaire({ idCommentaire: 1 });
      prisma.commentaire.findUnique.mockResolvedValue(c);
      const updated = { ...c, contenu: 'Modifie' };
      prisma.commentaire.update.mockResolvedValue(updated);

      const result = await service.update(1, { contenu: 'Modifie' } as any);

      expect(prisma.commentaire.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            contenu: 'Modifie',
            dateModification: expect.any(Date),
          }),
        }),
      );
      expect(result.contenu).toBe('Modifie');
    });

    it("leve NotFoundException si le commentaire n'existe pas", async () => {
      prisma.commentaire.findUnique.mockResolvedValue(null);

      await expect(service.update(99, {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('supprime le commentaire si il existe', async () => {
      const c = makeCommentaire({ idCommentaire: 1 });
      prisma.commentaire.findUnique.mockResolvedValue(c);
      prisma.commentaire.delete.mockResolvedValue(c);

      await service.remove(1);

      expect(prisma.commentaire.delete).toHaveBeenCalledWith({
        where: { idCommentaire: 1 },
      });
    });

    it("leve NotFoundException si le commentaire n'existe pas", async () => {
      prisma.commentaire.findUnique.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
