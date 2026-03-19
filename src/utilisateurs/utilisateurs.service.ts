import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateUtilisateurDto } from './dto/update-utilisateur.dto';

@Injectable()
export class UtilisateursService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string) {
    const utilisateurs = await this.prisma.utilisateur.findMany({
      where: search
        ? {
            OR: [
              { prenom: { contains: search, mode: 'insensitive' } },
              { nom: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      orderBy: { dateCreation: 'desc' },
    });

    return utilisateurs.map(({ motDePasse, ...u }) => u);
  }

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

  async updateStatut(id: number, statut: string) {
    await this.findById(id);

    const utilisateur = await this.prisma.utilisateur.update({
      where: { idUtilisateur: id },
      data: { statut: statut as any },
    });

    const { motDePasse, ...safeUser } = utilisateur;
    void motDePasse;
    return safeUser;
  }

  async updateRole(id: number, role: string) {
    await this.findById(id);

    const utilisateur = await this.prisma.utilisateur.update({
      where: { idUtilisateur: id },
      data: { role: role as any },
    });

    const { motDePasse, ...safeUser } = utilisateur;
    void motDePasse;
    return safeUser;
  }

  async remove(id: number) {
    await this.findById(id);

    return this.prisma.utilisateur.delete({
      where: { idUtilisateur: id },
    });
  }
}
