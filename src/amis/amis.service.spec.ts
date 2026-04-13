import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { AmisService } from './amis.service';
import { PrismaService } from '../prisma/prisma.service';
import { asPrismaService, createPrismaMock, type PrismaMock } from '../test-utils/prisma.mock';
import { resetFixtureIds } from '../test-utils/fixtures';

const makeAmi = (overrides: any = {}) => ({
  idUtilisateur1: 1,
  idUtilisateur2: 2,
  dateCreation: new Date('2024-01-01'),
  statut: 'EN_ATTENTE',
  utilisateur1: { idUtilisateur: 1, prenom: 'Alice', nom: 'A' },
  utilisateur2: { idUtilisateur: 2, prenom: 'Bob', nom: 'B' },
  ...overrides,
});

describe('AmisService', () => {
  let service: AmisService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    resetFixtureIds();
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AmisService,
        { provide: PrismaService, useValue: asPrismaService(prisma) },
      ],
    }).compile();

    service = module.get<AmisService>(AmisService);
  });

  describe('findByUtilisateur', () => {
    it("retourne les amis acceptes avec l'ami correspondant", async () => {
      const amiRecord = makeAmi({ idUtilisateur1: 1, idUtilisateur2: 2, statut: 'ACCEPTE' });
      prisma.ami.findMany.mockResolvedValue([amiRecord]);

      const result = await service.findByUtilisateur(1);

      expect(result[0].ami).toEqual(amiRecord.utilisateur2);
    });

    it("retourne l'utilisateur1 comme ami quand l'utilisateur est utilisateur2", async () => {
      const amiRecord = makeAmi({ idUtilisateur1: 3, idUtilisateur2: 1, statut: 'ACCEPTE' });
      prisma.ami.findMany.mockResolvedValue([amiRecord]);

      const result = await service.findByUtilisateur(1);

      expect(result[0].ami).toEqual(amiRecord.utilisateur1);
    });

    it("filtre sur statut ACCEPTE et OR des deux ids", async () => {
      prisma.ami.findMany.mockResolvedValue([]);

      await service.findByUtilisateur(5);

      expect(prisma.ami.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ statut: 'ACCEPTE' }),
        }),
      );
    });
  });

  describe('findDemandesRecues', () => {
    it("retourne les demandes EN_ATTENTE recues par l'utilisateur", async () => {
      prisma.ami.findMany.mockResolvedValue([makeAmi()]);

      await service.findDemandesRecues(2);

      expect(prisma.ami.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { idUtilisateur2: 2, statut: 'EN_ATTENTE' },
        }),
      );
    });
  });

  describe('findDemandesEnvoyees', () => {
    it("retourne les demandes EN_ATTENTE envoyees par l'utilisateur", async () => {
      prisma.ami.findMany.mockResolvedValue([makeAmi()]);

      await service.findDemandesEnvoyees(1);

      expect(prisma.ami.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { idUtilisateur1: 1, statut: 'EN_ATTENTE' },
        }),
      );
    });
  });

  describe('envoyer', () => {
    it("cree une demande si elle n'existe pas", async () => {
      prisma.ami.findUnique.mockResolvedValue(null);
      prisma.ami.create.mockResolvedValue(makeAmi());

      await service.envoyer(1, 2);

      expect(prisma.ami.create).toHaveBeenCalledTimes(1);
    });

    it("leve ConflictException si une demande existe deja", async () => {
      prisma.ami.findUnique.mockResolvedValue(makeAmi());

      await expect(service.envoyer(1, 2)).rejects.toThrow(ConflictException);
    });

    it("normalise les ids (min/max) avant de verifier l'existence", async () => {
      prisma.ami.findUnique.mockResolvedValue(null);
      prisma.ami.create.mockResolvedValue(makeAmi({ idUtilisateur1: 1, idUtilisateur2: 5 }));

      await service.envoyer(5, 1);

      const callWhere = prisma.ami.findUnique.mock.calls[0][0].where;
      expect(callWhere.idUtilisateur1_idUtilisateur2.idUtilisateur1).toBe(1);
      expect(callWhere.idUtilisateur1_idUtilisateur2.idUtilisateur2).toBe(5);
    });
  });

  describe('accepter', () => {
    it("passe le statut a ACCEPTE", async () => {
      prisma.ami.findUnique.mockResolvedValue(makeAmi());
      prisma.ami.update.mockResolvedValue(makeAmi({ statut: 'ACCEPTE' }));

      await service.accepter(1, 2);

      expect(prisma.ami.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { statut: 'ACCEPTE' } }),
      );
    });

    it("leve NotFoundException si la demande est introuvable", async () => {
      prisma.ami.findUnique.mockResolvedValue(null);

      await expect(service.accepter(1, 2)).rejects.toThrow(NotFoundException);
    });
  });

  describe('refuser', () => {
    it("passe le statut a REFUSE", async () => {
      prisma.ami.findUnique.mockResolvedValue(makeAmi());
      prisma.ami.update.mockResolvedValue(makeAmi({ statut: 'REFUSE' }));

      await service.refuser(1, 2);

      expect(prisma.ami.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { statut: 'REFUSE' } }),
      );
    });

    it("leve NotFoundException si la demande est introuvable", async () => {
      prisma.ami.findUnique.mockResolvedValue(null);

      await expect(service.refuser(1, 2)).rejects.toThrow(NotFoundException);
    });
  });

  describe('supprimer', () => {
    it("supprime la relation via les ids normalises", async () => {
      prisma.ami.delete.mockResolvedValue(makeAmi());

      await service.supprimer(5, 1);

      const callWhere = prisma.ami.delete.mock.calls[0][0].where;
      expect(callWhere.idUtilisateur1_idUtilisateur2.idUtilisateur1).toBe(1);
      expect(callWhere.idUtilisateur1_idUtilisateur2.idUtilisateur2).toBe(5);
    });
  });
});
