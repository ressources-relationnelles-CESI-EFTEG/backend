import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateCategorieDto } from './dto/create-categorie.dto';
import type { UpdateCategorieDto } from './dto/update-categorie.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.categorie.findMany({
      include: { enfants: true },
      orderBy: { nom: 'asc' },
    });
  }

  async findById(id: number) {
    const categorie = await this.prisma.categorie.findUnique({
      where: { idCategorie: id },
      include: { enfants: true },
    });

    if (!categorie) {
      throw new NotFoundException(`Catégorie #${id} introuvable.`);
    }

    return categorie;
  }

  async create(dto: CreateCategorieDto) {
    return this.prisma.categorie.create({
      data: dto,
      include: { enfants: true },
    });
  }

  async update(id: number, dto: UpdateCategorieDto) {
    await this.findById(id);

    return this.prisma.categorie.update({
      where: { idCategorie: id },
      data: dto,
      include: { enfants: true },
    });
  }

  async remove(id: number) {
    await this.findById(id);

    return this.prisma.categorie.delete({
      where: { idCategorie: id },
    });
  }
}
