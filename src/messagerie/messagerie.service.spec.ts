import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { MessagerieService } from './messagerie.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  asPrismaService,
  createPrismaMock,
  type PrismaMock,
} from '../test-utils/prisma.mock';
import {
  makeConversation,
  makeMessage,
  resetFixtureIds,
} from '../test-utils/fixtures';

const makeConvFull = (overrides: any = {}) => ({
  ...makeConversation(overrides),
  participants: [],
  messages: [],
  ...overrides,
});

describe('MessagerieService', () => {
  let service: MessagerieService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    resetFixtureIds();
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagerieService,
        { provide: PrismaService, useValue: asPrismaService(prisma) },
      ],
    }).compile();

    service = module.get<MessagerieService>(MessagerieService);
  });

  // ─── findConversationsByUtilisateur ─────────────────────────────────────────

  describe('findConversationsByUtilisateur', () => {
    it('retourne les conversations avec dernierMessage', async () => {
      const msg = makeMessage({ idConversation: 1 });
      const conv = makeConvFull({ idConversation: 1, messages: [msg] });
      prisma.conversation.findMany.mockResolvedValue([conv]);

      const result = await service.findConversationsByUtilisateur(1);

      expect(result[0].dernierMessage).toEqual(msg);
      expect(result[0].messages).toBeUndefined();
    });

    it('retourne null pour dernierMessage si aucun message', async () => {
      const conv = makeConvFull({ messages: [] });
      prisma.conversation.findMany.mockResolvedValue([conv]);

      const result = await service.findConversationsByUtilisateur(1);

      expect(result[0].dernierMessage).toBeNull();
    });

    it('filtre par idUtilisateur participant', async () => {
      prisma.conversation.findMany.mockResolvedValue([]);

      await service.findConversationsByUtilisateur(7);

      expect(prisma.conversation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { participants: { some: { idUtilisateur: 7 } } },
        }),
      );
    });
  });

  // ─── findConversationById ────────────────────────────────────────────────────

  describe('findConversationById', () => {
    it('retourne la conversation si elle existe', async () => {
      const conv = makeConvFull({ idConversation: 3 });
      prisma.conversation.findUnique.mockResolvedValue(conv);

      const result = await service.findConversationById(3);

      expect(result.idConversation).toBe(3);
    });

    it('leve NotFoundException si la conversation est introuvable', async () => {
      prisma.conversation.findUnique.mockResolvedValue(null);

      await expect(service.findConversationById(99)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── findMessages ────────────────────────────────────────────────────────────

  describe('findMessages', () => {
    it("retourne les messages de la conversation dans l'ordre chronologique", async () => {
      const conv = makeConvFull({ idConversation: 1 });
      prisma.conversation.findUnique.mockResolvedValue(conv);
      const msgs = [makeMessage(), makeMessage()];
      prisma.message.findMany.mockResolvedValue(msgs);

      const result = await service.findMessages(1);

      expect(result).toHaveLength(2);
      expect(prisma.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { idConversation: 1 },
          orderBy: { dateEnvoi: 'asc' },
        }),
      );
    });

    it("leve NotFoundException si la conversation n'existe pas", async () => {
      prisma.conversation.findUnique.mockResolvedValue(null);

      await expect(service.findMessages(99)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── createConversation ──────────────────────────────────────────────────────

  describe('createConversation', () => {
    it('cree une conversation avec les participants', async () => {
      const conv = makeConvFull({ participants: [] });
      prisma.conversation.create.mockResolvedValue(conv);

      const result = await service.createConversation({
        participantIds: [1, 2],
      });

      expect(prisma.conversation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            participants: {
              create: [{ idUtilisateur: 1 }, { idUtilisateur: 2 }],
            },
          },
        }),
      );
      expect(result).toBeDefined();
    });
  });

  // ─── sendMessage ─────────────────────────────────────────────────────────────

  describe('sendMessage', () => {
    it('cree un message dans la conversation', async () => {
      const conv = makeConvFull({ idConversation: 1 });
      prisma.conversation.findUnique.mockResolvedValue(conv);
      const msg = makeMessage({ contenu: 'Bonjour' });
      prisma.message.create.mockResolvedValue(msg);

      const result = await service.sendMessage(1, { contenu: 'Bonjour' }, 2);

      expect(prisma.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { idConversation: 1, idUtilisateur: 2, contenu: 'Bonjour' },
        }),
      );
      expect(result.contenu).toBe('Bonjour');
    });

    it("leve NotFoundException si la conversation n'existe pas", async () => {
      prisma.conversation.findUnique.mockResolvedValue(null);

      await expect(
        service.sendMessage(99, { contenu: 'test' }, 1),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── markAsRead ──────────────────────────────────────────────────────────────

  describe('markAsRead', () => {
    it('marque les messages des autres comme lus', async () => {
      const conv = makeConvFull({ idConversation: 1 });
      prisma.conversation.findUnique.mockResolvedValue(conv);
      prisma.message.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.markAsRead(1, 2);

      expect(prisma.message.updateMany).toHaveBeenCalledWith({
        where: {
          idConversation: 1,
          idUtilisateur: { not: 2 },
          lu: false,
        },
        data: { lu: true },
      });
      expect(result.count).toBe(3);
    });

    it("leve NotFoundException si la conversation n'existe pas", async () => {
      prisma.conversation.findUnique.mockResolvedValue(null);

      await expect(service.markAsRead(99, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── countUnread ─────────────────────────────────────────────────────────────

  describe('countUnread', () => {
    it('retourne le nombre de messages non lus', async () => {
      prisma.message.count.mockResolvedValue(5);

      const result = await service.countUnread(1);

      expect(result).toEqual({ nonLus: 5 });
      expect(prisma.message.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            lu: false,
            idUtilisateur: { not: 1 },
          }),
        }),
      );
    });

    it('retourne 0 quand aucun message non lu', async () => {
      prisma.message.count.mockResolvedValue(0);

      const result = await service.countUnread(1);

      expect(result).toEqual({ nonLus: 0 });
    });
  });
});
