import { Injectable, NotFoundException } from '@nestjs/common';
import { StatutSignalement } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateSignalementDto } from './dto/create-signalement.dto';
import type { UpdateSignalementDto } from './dto/update-signalement.dto';

@Injectable()
export class SignalementsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultInclude = {
    utilisateur: { select: { idUtilisateur: true, prenom: true, nom: true } },
    ressource: { select: { idRessource: true, titre: true } },
    commentaire: { select: { idCommentaire: true, contenu: true } },
    moderateur: { select: { idUtilisateur: true, prenom: true, nom: true } },
  };

  async findAll(statut?: string) {
    return this.prisma.signalement.findMany({
      where: statut ? { statut: statut as StatutSignalement } : {},
      include: this.defaultInclude,
      orderBy: { dateCreation: 'desc' },
    });
  }

  async findById(id: number) {
    const signalement = await this.prisma.signalement.findUnique({
      where: { idSignalement: id },
      include: this.defaultInclude,
    });

    if (!signalement) {
      throw new NotFoundException(`Signalement #${id} introuvable.`);
    }

    return signalement;
  }

  async create(dto: CreateSignalementDto) {
    return this.prisma.signalement.create({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: dto as any,
      include: this.defaultInclude,
    });
  }

  async update(id: number, dto: UpdateSignalementDto) {
    await this.findById(id);

    return this.prisma.signalement.update({
      where: { idSignalement: id },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: {
        ...(dto as any),
        ...(dto.statut && dto.statut !== 'EN_ATTENTE'
          ? { dateTraitement: new Date() }
          : {}),
      },
      include: this.defaultInclude,
    });
  }

  async remove(id: number) {
    await this.findById(id);
    return this.prisma.signalement.delete({ where: { idSignalement: id } });
  }
}
