import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { StatutUtilisateur } from '@prisma/client';

import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  asPrismaService,
  createPrismaMock,
  type PrismaMock,
} from '../test-utils/prisma.mock';
import {
  makeUser,
  resetFixtureIds,
  uniqueConstraintError,
} from '../test-utils/fixtures';

import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('$2a$10$hashedpassword'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    resetFixtureIds();
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: asPrismaService(prisma) },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── login ──────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('retourne accessToken et user pour des credentials valides', async () => {
      const user = makeUser({ email: 'alice@example.com' });
      prisma.utilisateur.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'alice@example.com',
        password: 'password123',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe('alice@example.com');
      expect(result.user.role).toBe('citoyen');
    });

    it("trim et lowercase l'email avant la recherche", async () => {
      const user = makeUser({ email: 'alice@example.com' });
      prisma.utilisateur.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login({ email: '  ALICE@EXAMPLE.COM  ', password: 'pw' });

      expect(prisma.utilisateur.findUnique).toHaveBeenCalledWith({
        where: { email: 'alice@example.com' },
      });
    });

    it("leve UnauthorizedException si l'utilisateur est introuvable", async () => {
      prisma.utilisateur.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'unknown@example.com', password: 'pw' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('leve UnauthorizedException si le mot de passe est incorrect', async () => {
      const user = makeUser();
      prisma.utilisateur.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: user.email, password: 'mauvais' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('leve UnauthorizedException si le statut est INACTIF', async () => {
      const user = makeUser({ statut: StatutUtilisateur.INACTIF });
      prisma.utilisateur.findUnique.mockResolvedValue(user);

      await expect(
        service.login({ email: user.email, password: 'pw' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('leve UnauthorizedException si le statut est SUSPENDU', async () => {
      const user = makeUser({ statut: StatutUtilisateur.SUSPENDU });
      prisma.utilisateur.findUnique.mockResolvedValue(user);

      await expect(
        service.login({ email: user.email, password: 'pw' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("leve BadRequestException si l'email est absent", async () => {
      await expect(
        service.login({ email: '', password: 'pw' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('leve BadRequestException si le mot de passe est absent', async () => {
      await expect(
        service.login({ email: 'a@b.com', password: '' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── register ────────────────────────────────────────────────────────────────

  describe('register', () => {
    const validInput = {
      firstname: 'Jean',
      lastname: 'Dupont',
      email: 'jean@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    it("cree l'utilisateur et retourne un message de succes", async () => {
      const user = makeUser({
        email: validInput.email,
        prenom: 'Jean',
        nom: 'Dupont',
      });
      prisma.utilisateur.create.mockResolvedValue(user);

      const result = await service.register(validInput);

      expect(result.message).toBe('Compte créé avec succès');
      expect(result.user.email).toBe(validInput.email);
      expect(prisma.utilisateur.create).toHaveBeenCalledTimes(1);
    });

    it('leve BadRequestException si les mots de passe ne correspondent pas', async () => {
      await expect(
        service.register({ ...validInput, confirmPassword: 'different' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('leve BadRequestException si le mot de passe est trop court (< 8 chars)', async () => {
      await expect(
        service.register({
          ...validInput,
          password: 'short',
          confirmPassword: 'short',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('leve BadRequestException si le prenom est manquant', async () => {
      await expect(
        service.register({ ...validInput, firstname: '' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('leve BadRequestException si le nom est manquant', async () => {
      await expect(
        service.register({ ...validInput, lastname: '' }),
      ).rejects.toThrow(BadRequestException);
    });

    it("leve BadRequestException si l'email est manquant", async () => {
      await expect(
        service.register({ ...validInput, email: '' }),
      ).rejects.toThrow(BadRequestException);
    });

    it("leve ConflictException si l'email est deja utilise (P2002)", async () => {
      prisma.utilisateur.create.mockRejectedValue(
        uniqueConstraintError('email'),
      );

      await expect(service.register(validInput)).rejects.toThrow(
        ConflictException,
      );
    });

    it('propage les erreurs inconnues de la DB telles quelles', async () => {
      const dbError = new Error('Unexpected DB error');
      prisma.utilisateur.create.mockRejectedValue(dbError);

      await expect(service.register(validInput)).rejects.toThrow(
        'Unexpected DB error',
      );
    });
  });

  // ─── createAdmin ──────────────────────────────────────────────────────────────

  describe('createAdmin', () => {
    const validInput = {
      firstname: 'Admin',
      lastname: 'Super',
      email: 'admin@example.com',
      password: 'adminpass',
      confirmPassword: 'adminpass',
    };

    it('cree un admin et retourne un message de succes', async () => {
      const user = makeUser({
        email: validInput.email,
        role: 'ADMINISTRATEUR' as any,
      });
      prisma.utilisateur.create.mockResolvedValue(user);

      const result = await service.createAdmin(validInput);

      expect(result.message).toBe('Compte administrateur créé avec succès');
      expect(prisma.utilisateur.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ role: 'ADMINISTRATEUR' }),
        }),
      );
    });

    it('leve BadRequestException si un champ est manquant', async () => {
      await expect(
        service.createAdmin({ ...validInput, firstname: '' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('leve BadRequestException si le mot de passe est trop court', async () => {
      await expect(
        service.createAdmin({ ...validInput, password: '1234567' }),
      ).rejects.toThrow(BadRequestException);
    });

    it("leve ConflictException si l'email est deja utilise", async () => {
      prisma.utilisateur.create.mockRejectedValue(
        uniqueConstraintError('email'),
      );

      await expect(service.createAdmin(validInput)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ─── verifyToken ─────────────────────────────────────────────────────────────

  describe('verifyToken', () => {
    it('retourne userId et email pour un token valide', async () => {
      const user = makeUser({ idUtilisateur: 42, email: 'test@example.com' });
      prisma.utilisateur.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const { accessToken } = await service.login({
        email: user.email,
        password: 'pw',
      });
      const payload = service.verifyToken(accessToken);

      expect(payload).toEqual({ userId: 42, email: 'test@example.com' });
    });

    it('retourne null pour un token avec signature invalide', () => {
      expect(service.verifyToken('abc.invalidsignature')).toBeNull();
    });

    it('retourne null si le token ne contient pas de point', () => {
      expect(service.verifyToken('tokenSansPoint')).toBeNull();
    });

    it('retourne null pour un token expire (> 24h)', () => {
      const user = makeUser({ idUtilisateur: 1, email: 'old@example.com' });
      const { createHmac } = require('crypto');
      const secret = process.env.AUTH_TOKEN_SECRET ?? 'dev-sign-in-secret';
      const oldTimestamp = Date.now() - 25 * 60 * 60 * 1000;
      const payload = `${user.idUtilisateur}:${user.email}:${oldTimestamp}`;
      const payloadB64 = Buffer.from(payload).toString('base64url');
      const sig = createHmac('sha256', secret).update(payloadB64).digest('hex');

      expect(service.verifyToken(`${payloadB64}.${sig}`)).toBeNull();
    });

    it('retourne null pour une chaine vide', () => {
      expect(service.verifyToken('')).toBeNull();
    });
  });
});
