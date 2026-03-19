import { Injectable, NotFoundException } from '@nestjs/common';
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
      data: dto as any,
      include: this.defaultInclude,
    });
  }

  async update(id: number, dto: UpdateRessourceDto) {
    await this.findById(id);

    return this.prisma.ressource.update({
      where: { idRessource: id },
      data: {
        ...dto as any,
        dateModification: new Date(),
      },
      include: this.defaultInclude,
    });
  }

  async remove(id: number) {
    await this.findById(id);

    return this.prisma.ressource.delete({
      where: { idRessource: id },
    });
  }
}
