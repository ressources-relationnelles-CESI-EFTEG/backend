import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateRessourceDto } from './dto/create-ressource.dto';
import type { UpdateRessourceDto } from './dto/update-ressource.dto';

@Injectable()
export class RessourcesService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultInclude = {
    categorie: true,
    utilisateur: { select: { idUtilisateur: true, prenom: true, nom: true } },
    tags: { include: { tag: true } },
  };

  async findForModeration() {
    return this.prisma.ressource.findMany({
      where: {
        statut: { in: ['EN_ATTENTE', 'REJETEE'] },
      },
      include: this.defaultInclude,
      orderBy: { dateCreation: 'desc' },
    });
  }

  async findAll(categorieId?: number) {
    return this.prisma.ressource.findMany({
      where: {
        statut: 'VALIDEE',
        visibilite: 'PUBLIQUE',
        ...(categorieId ? { idCategorie: categorieId } : {}),
      },
      include: this.defaultInclude,
      orderBy: { dateCreation: 'desc' },
    });
  }

  async findById(id: number) {
    const ressource = await this.prisma.ressource.findUnique({
      where: { idRessource: id },
      include: this.defaultInclude,
    });

    if (!ressource) {
      throw new NotFoundException(`Ressource #${id} introuvable.`);
    }

    return ressource;
  }

  async findByUtilisateur(idUtilisateur: number) {
    return this.prisma.ressource.findMany({
      where: { idUtilisateur },
      include: this.defaultInclude,
      orderBy: { dateCreation: 'desc' },
    });
  }

  async create(dto: CreateRessourceDto) {
    return this.prisma.ressource.create({
      data: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        ...(dto as any),
        statut: 'EN_ATTENTE',
      },
      include: this.defaultInclude,
    });
  }

  async update(id: number, dto: UpdateRessourceDto, requestingUserId: number) {
    const ressource = await this.findById(id);

    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { idUtilisateur: requestingUserId },
      select: { role: true },
    });

    const isModo = ['MODERATEUR', 'ADMINISTRATEUR', 'SUPER_ADMIN'].includes(
      utilisateur?.role ?? '',
    );
    const isOwner = ressource.idUtilisateur === requestingUserId;

    if (!isModo && !isOwner) {
      throw new ForbiddenException("Vous n'avez pas les droits nécessaires.");
    }

    // Le propriétaire ne peut pas choisir le statut : il repasse en EN_ATTENTE
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data: any = isModo
      ? { ...(dto as any), dateModification: new Date() }
      : { ...(dto as any), statut: 'EN_ATTENTE', motifRejet: null, dateModification: new Date() };

    return this.prisma.ressource.update({
      where: { idRessource: id },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data,
      include: this.defaultInclude,
    });
  }

  async remove(id: number) {
    await this.findById(id);

    return this.prisma.$transaction([
      this.prisma.signalement.deleteMany({ where: { idRessource: id } }),
      this.prisma.ressource.delete({ where: { idRessource: id } }),
    ]);
  }
}
