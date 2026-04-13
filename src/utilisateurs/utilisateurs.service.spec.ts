import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { UtilisateursService } from './utilisateurs.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  asPrismaService,
  createPrismaMock,
  type PrismaMock,
} from '../test-utils/prisma.mock';
import { makeUser, resetFixtureIds } from '../test-utils/fixtures';

describe('UtilisateursService', () => {
  let service: UtilisateursService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    resetFixtureIds();
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UtilisateursService,
        { provide: PrismaService, useValue: asPrismaService(prisma) },
      ],
    }).compile();

    service = module.get<UtilisateursService>(UtilisateursService);
  });

  // ─── findAll ─────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('retourne les utilisateurs sans motDePasse', async () => {
      const user = makeUser();
      prisma.utilisateur.findMany.mockResolvedValue([user]);

      const result = await service.findAll();

      expect(result[0]).not.toHaveProperty('motDePasse');
    });

    it('filtre par search sur prenom/nom/email', async () => {
      prisma.utilisateur.findMany.mockResolvedValue([]);

      await service.findAll('alice');

      const call = prisma.utilisateur.findMany.mock.calls[0][0];
      expect(call.where).toHaveProperty('OR');
    });

    it('retourne tous les utilisateurs sans filtre', async () => {
      prisma.utilisateur.findMany.mockResolvedValue([]);

      await service.findAll();

      const call = prisma.utilisateur.findMany.mock.calls[0][0];
      expect(call.where).toEqual({});
    });
  });

  // ─── findById ────────────────────────────────────────────────────────────────

  describe('findById', () => {
    it("retourne l'utilisateur sans motDePasse", async () => {
      const user = makeUser({ idUtilisateur: 1 });
      prisma.utilisateur.findUnique.mockResolvedValue(user);

      const result = await service.findById(1);

      expect(result).not.toHaveProperty('motDePasse');
      expect(result.idUtilisateur).toBe(1);
    });

    it("leve NotFoundException si l'utilisateur est introuvable", async () => {
      prisma.utilisateur.findUnique.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('met a jour les champs et retourne sans motDePasse', async () => {
      const user = makeUser({ idUtilisateur: 1 });
      prisma.utilisateur.findUnique.mockResolvedValue(user);
      const updated = { ...user, prenom: 'Marie' };
      prisma.utilisateur.update.mockResolvedValue(updated);

      const result = await service.update(1, { prenom: 'Marie' } as any);

      expect(result.prenom).toBe('Marie');
      expect(result).not.toHaveProperty('motDePasse');
    });

    it("leve NotFoundException si l'utilisateur n'existe pas", async () => {
      prisma.utilisateur.findUnique.mockResolvedValue(null);

      await expect(service.update(99, {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── updateStatut ────────────────────────────────────────────────────────────

  describe('updateStatut', () => {
    it("change le statut de l'utilisateur", async () => {
      const user = makeUser({ idUtilisateur: 1 });
      prisma.utilisateur.findUnique.mockResolvedValue(user);
      const updated = { ...user, statut: 'SUSPENDU' };
      prisma.utilisateur.update.mockResolvedValue(updated as any);

      const result = await service.updateStatut(1, 'SUSPENDU');

      expect(prisma.utilisateur.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { statut: 'SUSPENDU' } }),
      );
      expect(result).not.toHaveProperty('motDePasse');
    });

    it("leve NotFoundException si l'utilisateur n'existe pas", async () => {
      prisma.utilisateur.findUnique.mockResolvedValue(null);

      await expect(service.updateStatut(99, 'INACTIF')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── updateRole ──────────────────────────────────────────────────────────────

  describe('updateRole', () => {
    it("change le role de l'utilisateur", async () => {
      const user = makeUser({ idUtilisateur: 1 });
      prisma.utilisateur.findUnique.mockResolvedValue(user);
      const updated = { ...user, role: 'MODERATEUR' };
      prisma.utilisateur.update.mockResolvedValue(updated as any);

      const result = await service.updateRole(1, 'MODERATEUR');

      expect(prisma.utilisateur.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { role: 'MODERATEUR' } }),
      );
      expect(result).not.toHaveProperty('motDePasse');
    });

    it("leve NotFoundException si l'utilisateur n'existe pas", async () => {
      prisma.utilisateur.findUnique.mockResolvedValue(null);

      await expect(service.updateRole(99, 'MODERATEUR')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── remove ──────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it("supprime l'utilisateur s'il existe", async () => {
      const user = makeUser({ idUtilisateur: 1 });
      prisma.utilisateur.findUnique.mockResolvedValue(user);
      prisma.utilisateur.delete.mockResolvedValue(user);

      await service.remove(1);

      expect(prisma.utilisateur.delete).toHaveBeenCalledWith({
        where: { idUtilisateur: 1 },
      });
    });

    it("leve NotFoundException si l'utilisateur n'existe pas", async () => {
      prisma.utilisateur.findUnique.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
