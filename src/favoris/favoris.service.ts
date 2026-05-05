import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavorisService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUtilisateur(idUtilisateur: number) {
    const favoris = await this.prisma.favori.findMany({
      where: { idUtilisateur },
      include: {
        ressource: {
          include: {
            categorie: true,
            utilisateur: { select: { prenom: true, nom: true } },
          },
        },
      },
      orderBy: { dateAjout: 'desc' },
    });

    return favoris.map((f) => ({
      ...f.ressource,
      dateAjoutFavori: f.dateAjout,
      auteur: `${f.ressource.utilisateur.prenom} ${f.ressource.utilisateur.nom}`,
      categorie: f.ressource.categorie.nom,
    }));
  }

  async isFavori(idUtilisateur: number, idRessource: number) {
    const favori = await this.prisma.favori.findUnique({
      where: { idUtilisateur_idRessource: { idUtilisateur, idRessource } },
    });

    return { favori: !!favori };
  }

  async add(idUtilisateur: number, idRessource: number) {
    const existing = await this.prisma.favori.findUnique({
      where: { idUtilisateur_idRessource: { idUtilisateur, idRessource } },
    });

    if (existing) {
      throw new ConflictException('Cette ressource est déjà dans vos favoris.');
    }

    return this.prisma.favori.create({
      data: { idUtilisateur, idRessource },
    });
  }

  async remove(idUtilisateur: number, idRessource: number) {
    return this.prisma.favori.delete({
      where: { idUtilisateur_idRessource: { idUtilisateur, idRessource } },
    });
  }
}
