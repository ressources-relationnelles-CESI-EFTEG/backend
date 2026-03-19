import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AmisService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly userSelect = {
    select: { idUtilisateur: true, prenom: true, nom: true },
  };

  async findByUtilisateur(idUtilisateur: number) {
    const amis = await this.prisma.ami.findMany({
      where: {
        statut: 'ACCEPTE',
        OR: [
          { idUtilisateur1: idUtilisateur },
          { idUtilisateur2: idUtilisateur },
        ],
      },
      include: {
        utilisateur1: this.userSelect,
        utilisateur2: this.userSelect,
      },
      orderBy: { dateCreation: 'desc' },
    });

    return amis.map((a) => ({
      ami: a.idUtilisateur1 === idUtilisateur ? a.utilisateur2 : a.utilisateur1,
      dateCreation: a.dateCreation,
    }));
  }

  async findDemandesRecues(idUtilisateur: number) {
    return this.prisma.ami.findMany({
      where: {
        idUtilisateur2: idUtilisateur,
        statut: 'EN_ATTENTE',
      },
      include: { utilisateur1: this.userSelect },
      orderBy: { dateCreation: 'desc' },
    });
  }

  async findDemandesEnvoyees(idUtilisateur: number) {
    return this.prisma.ami.findMany({
      where: {
        idUtilisateur1: idUtilisateur,
        statut: 'EN_ATTENTE',
      },
      include: { utilisateur2: this.userSelect },
      orderBy: { dateCreation: 'desc' },
    });
  }

  async envoyer(idUtilisateur1: number, idUtilisateur2: number) {
    const [id1, id2] = [Math.min(idUtilisateur1, idUtilisateur2), Math.max(idUtilisateur1, idUtilisateur2)];

    const existing = await this.prisma.ami.findUnique({
      where: { idUtilisateur1_idUtilisateur2: { idUtilisateur1: id1, idUtilisateur2: id2 } },
    });

    if (existing) {
      throw new ConflictException('Une demande existe déjà entre ces utilisateurs.');
    }

    return this.prisma.ami.create({
      data: {
        idUtilisateur1: idUtilisateur1,
        idUtilisateur2: idUtilisateur2,
      },
    });
  }

  async accepter(idUtilisateur1: number, idUtilisateur2: number) {
    await this.findDemande(idUtilisateur1, idUtilisateur2);

    return this.prisma.ami.update({
      where: { idUtilisateur1_idUtilisateur2: { idUtilisateur1, idUtilisateur2 } },
      data: { statut: 'ACCEPTE' },
    });
  }

  async refuser(idUtilisateur1: number, idUtilisateur2: number) {
    await this.findDemande(idUtilisateur1, idUtilisateur2);

    return this.prisma.ami.update({
      where: { idUtilisateur1_idUtilisateur2: { idUtilisateur1, idUtilisateur2 } },
      data: { statut: 'REFUSE' },
    });
  }

  async supprimer(idUtilisateur1: number, idUtilisateur2: number) {
    const [id1, id2] = [Math.min(idUtilisateur1, idUtilisateur2), Math.max(idUtilisateur1, idUtilisateur2)];

    return this.prisma.ami.delete({
      where: { idUtilisateur1_idUtilisateur2: { idUtilisateur1: id1, idUtilisateur2: id2 } },
    });
  }

  private async findDemande(idUtilisateur1: number, idUtilisateur2: number) {
    const demande = await this.prisma.ami.findUnique({
      where: { idUtilisateur1_idUtilisateur2: { idUtilisateur1, idUtilisateur2 } },
    });

    if (!demande) {
      throw new NotFoundException('Demande introuvable.');
    }

    return demande;
  }
}
