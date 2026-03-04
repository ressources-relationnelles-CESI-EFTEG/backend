import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateUtilisateurDto } from './dto/update-utilisateur.dto';

@Injectable()
export class UtilisateursService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { idUtilisateur: id },
    });

    if (!utilisateur) {
      throw new NotFoundException(`Utilisateur #${id} introuvable.`);
    }

    const { motDePasse, ...safeUser } = utilisateur;
    void motDePasse;
    return safeUser;
  }

  async update(id: number, dto: UpdateUtilisateurDto) {
    await this.findById(id);

    const utilisateur = await this.prisma.utilisateur.update({
      where: { idUtilisateur: id },
      data: dto,
    });

    const { motDePasse, ...safeUser } = utilisateur;
    void motDePasse;
    return safeUser;
  }
}
