import { Injectable } from '@nestjs/common';
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
}
