import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateCommentaireDto } from './dto/create-commentaire.dto';
import type { UpdateCommentaireDto } from './dto/update-commentaire.dto';

@Injectable()
export class CommentairesService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultInclude = {
    utilisateur: { select: { idUtilisateur: true, prenom: true, nom: true } },
    reponses: {
      include: {
        utilisateur: { select: { idUtilisateur: true, prenom: true, nom: true } },
      },
      orderBy: { dateCreation: 'asc' as const },
    },
  };

  async findByRessource(idRessource: number) {
    return this.prisma.commentaire.findMany({
      where: {
        idRessource,
        idCommentaireParent: null,
        statut: 'VISIBLE',
      },
      include: this.defaultInclude,
      orderBy: { dateCreation: 'desc' },
    });
  }

  async findById(id: number) {
    const commentaire = await this.prisma.commentaire.findUnique({
      where: { idCommentaire: id },
      include: this.defaultInclude,
    });

    if (!commentaire) {
      throw new NotFoundException(`Commentaire #${id} introuvable.`);
    }

    return commentaire;
  }

  async create(dto: CreateCommentaireDto) {
    return this.prisma.commentaire.create({
      data: dto as any,
      include: this.defaultInclude,
    });
  }

  async update(id: number, dto: UpdateCommentaireDto) {
    await this.findById(id);

    return this.prisma.commentaire.update({
      where: { idCommentaire: id },
      data: {
        ...dto as any,
        dateModification: new Date(),
      },
      include: this.defaultInclude,
    });
  }

  async remove(id: number) {
    await this.findById(id);

    return this.prisma.commentaire.delete({
      where: { idCommentaire: id },
    });
  }
}
