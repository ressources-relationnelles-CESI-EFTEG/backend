import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';

import { FavorisService } from './favoris.service';
import { PrismaService } from '../prisma/prisma.service';
import { asPrismaService, createPrismaMock, type PrismaMock } from '../test-utils/prisma.mock';
import { makeRessource, makeCategorie, makeUser, resetFixtureIds } from '../test-utils/fixtures';

const makeFavoriRecord = (idUtilisateur = 1, idRessource = 1) => {
  const ressource = makeRessource({ idRessource });
  const categorie = makeCategorie();
  const user = makeUser({ idUtilisateur });
  return {
    idUtilisateur,
    idRessource,
    dateAjout: new Date('2024-01-01'),
    ressource: {
      ...ressource,
      utilisateur: { prenom: user.prenom, nom: user.nom },
      categorie: { nom: categorie.nom },
    },
  };
};

describe('FavorisService', () => {
  let service: FavorisService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    resetFixtureIds();
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavorisService,
        { provide: PrismaService, useValue: asPrismaService(prisma) },
      ],
    }).compile();

    service = module.get<FavorisService>(FavorisService);
  });

  describe('findByUtilisateur', () => {
    it("retourne les favoris avec dateAjoutFavori et auteur", async () => {
      prisma.favori.findMany.mockResolvedValue([makeFavoriRecord(1, 1)]);

      const result = await service.findByUtilisateur(1);

      expect(result[0]).toHaveProperty('dateAjoutFavori');
      expect(result[0]).toHaveProperty('auteur');
      expect(result[0]).toHaveProperty('categorie');
    });

    it("filtre par idUtilisateur", async () => {
      prisma.favori.findMany.mockResolvedValue([]);

      await service.findByUtilisateur(3);

      expect(prisma.favori.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { idUtilisateur: 3 } }),
      );
    });
  });

  describe('isFavori', () => {
    it("retourne favori: true si l'entree existe", async () => {
      prisma.favori.findUnique.mockResolvedValue({ idUtilisateur: 1, idRessource: 1, dateAjout: new Date() });

      const result = await service.isFavori(1, 1);

      expect(result).toEqual({ favori: true });
    });

    it("retourne favori: false si l'entree n'existe pas", async () => {
      prisma.favori.findUnique.mockResolvedValue(null);

      const result = await service.isFavori(1, 99);

      expect(result).toEqual({ favori: false });
    });
  });

  describe('add', () => {
    it("ajoute le favori si il n'existe pas", async () => {
      prisma.favori.findUnique.mockResolvedValue(null);
      prisma.favori.create.mockResolvedValue({ idUtilisateur: 1, idRessource: 1, dateAjout: new Date() });

      await service.add(1, 1);

      expect(prisma.favori.create).toHaveBeenCalledWith({ data: { idUtilisateur: 1, idRessource: 1 } });
    });

    it("leve ConflictException si le favori existe deja", async () => {
      prisma.favori.findUnique.mockResolvedValue({ idUtilisateur: 1, idRessource: 1, dateAjout: new Date() });

      await expect(service.add(1, 1)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it("supprime le favori via la cle composite", async () => {
      prisma.favori.delete.mockResolvedValue({ idUtilisateur: 1, idRessource: 1, dateAjout: new Date() });

      await service.remove(1, 1);

      expect(prisma.favori.delete).toHaveBeenCalledWith({
        where: { idUtilisateur_idRessource: { idUtilisateur: 1, idRessource: 1 } },
      });
    });
  });
});
