import { Injectable, NotFoundException } from '@nestjs/common';
import { TypeProgression } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateProgressionDto } from './dto/create-progression.dto';
import type { UpdateProgressionDto } from './dto/update-progression.dto';

@Injectable()
export class ProgressionsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultInclude = {
    ressource: {
      select: { idRessource: true, titre: true, typeRessource: true },
    },
  };

  async findByUtilisateur(idUtilisateur: number, type?: string) {
    return this.prisma.progression.findMany({
      where: {
        idUtilisateur,
        ...(type ? { typeProgression: type as TypeProgression } : {}),
      },
      include: this.defaultInclude,
      orderBy: { dateAjout: 'desc' },
    });
  }

  async findById(id: number) {
    const progression = await this.prisma.progression.findUnique({
      where: { idProgression: id },
      include: this.defaultInclude,
    });

    if (!progression) {
      throw new NotFoundException(`Progression #${id} introuvable.`);
    }

    return progression;
  }

  async create(dto: CreateProgressionDto) {
    return this.prisma.progression.create({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: dto as any,
      include: this.defaultInclude,
    });
  }

  async update(id: number, dto: UpdateProgressionDto) {
    await this.findById(id);

    return this.prisma.progression.update({
      where: { idProgression: id },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: dto as any,
      include: this.defaultInclude,
    });
  }

  async remove(id: number) {
    await this.findById(id);
    return this.prisma.progression.delete({ where: { idProgression: id } });
  }
}
