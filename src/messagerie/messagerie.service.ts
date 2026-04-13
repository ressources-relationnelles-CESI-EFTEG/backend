import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateConversationDto } from './dto/create-conversation.dto';
import type { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagerieService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly participantSelect = {
    utilisateur: { select: { idUtilisateur: true, prenom: true, nom: true } },
  };

  async findConversationsByUtilisateur(idUtilisateur: number) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: { some: { idUtilisateur } },
      },
      include: {
        participants: { include: this.participantSelect },
        messages: {
          orderBy: { dateEnvoi: 'desc' },
          take: 1,
          include: {
            utilisateur: {
              select: { idUtilisateur: true, prenom: true, nom: true },
            },
          },
        },
      },
      orderBy: { dateCreation: 'desc' },
    });

    return conversations.map((conv) => ({
      ...conv,
      dernierMessage: conv.messages[0] ?? null,
      messages: undefined,
    }));
  }

  async findConversationById(id: number) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { idConversation: id },
      include: {
        participants: { include: this.participantSelect },
      },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation #${id} introuvable.`);
    }

    return conversation;
  }

  async findMessages(idConversation: number) {
    await this.findConversationById(idConversation);

    return this.prisma.message.findMany({
      where: { idConversation },
      include: {
        utilisateur: {
          select: { idUtilisateur: true, prenom: true, nom: true },
        },
      },
      orderBy: { dateEnvoi: 'asc' },
    });
  }

  async createConversation(dto: CreateConversationDto) {
    return this.prisma.conversation.create({
      data: {
        participants: {
          create: dto.participantIds.map((id) => ({ idUtilisateur: id })),
        },
      },
      include: {
        participants: { include: this.participantSelect },
      },
    });
  }

  async sendMessage(idConversation: number, dto: SendMessageDto) {
    await this.findConversationById(idConversation);

    return this.prisma.message.create({
      data: {
        idConversation,
        idUtilisateur: dto.idUtilisateur,
        contenu: dto.contenu,
      },
      include: {
        utilisateur: {
          select: { idUtilisateur: true, prenom: true, nom: true },
        },
      },
    });
  }

  async markAsRead(idConversation: number, idUtilisateur: number) {
    await this.findConversationById(idConversation);

    return this.prisma.message.updateMany({
      where: {
        idConversation,
        idUtilisateur: { not: idUtilisateur },
        lu: false,
      },
      data: { lu: true },
    });
  }

  async countUnread(idUtilisateur: number) {
    const count = await this.prisma.message.count({
      where: {
        lu: false,
        idUtilisateur: { not: idUtilisateur },
        conversation: {
          participants: { some: { idUtilisateur } },
        },
      },
    });

    return { nonLus: count };
  }
}
