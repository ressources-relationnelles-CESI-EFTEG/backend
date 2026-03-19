import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tag.findMany({
      orderBy: { nom: 'asc' },
    });
  }

  async findById(id: number) {
    const tag = await this.prisma.tag.findUnique({
      where: { idTag: id },
    });

    if (!tag) {
      throw new NotFoundException(`Tag #${id} introuvable.`);
    }

    return tag;
  }

  async create(dto: CreateTagDto) {
    const existing = await this.prisma.tag.findUnique({
      where: { nom: dto.nom },
    });

    if (existing) {
      throw new ConflictException(`Le tag "${dto.nom}" existe déjà.`);
    }

    return this.prisma.tag.create({ data: dto });
  }

  async remove(id: number) {
    await this.findById(id);
    return this.prisma.tag.delete({ where: { idTag: id } });
  }

  async addToRessource(idRessource: number, idTag: number) {
    return this.prisma.ressourceTag.create({
      data: { idRessource, idTag },
    });
  }

  async removeFromRessource(idRessource: number, idTag: number) {
    return this.prisma.ressourceTag.delete({
      where: { idRessource_idTag: { idRessource, idTag } },
    });
  }
}
