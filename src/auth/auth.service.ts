import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { StatutUtilisateur, type Utilisateur } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { SignInDto } from './dto/sign-in.dto';
import type { SignUpDto } from './dto/sign-up.dto';
import type { SignInResponse, SignedInUser } from './auth.types';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async signIn(input: SignInDto): Promise<SignInResponse> {
    const email = input?.email?.trim().toLowerCase();
    const password = input?.password;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required.');
    }

    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { email },
    });

    if (!utilisateur || utilisateur.statut !== StatutUtilisateur.ACTIF) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const validPassword = this.isPasswordValid(
      password,
      utilisateur.motDePasse,
    );
    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return {
      data: {
        accessToken: this.buildAccessToken(utilisateur),
        user: this.sanitizeUser(utilisateur),
      },
    };
  }

  async signUp(input: SignUpDto): Promise<SignInResponse> {
    const prenom = input?.prenom?.trim();
    const nom = input?.nom?.trim();
    const email = input?.email?.trim().toLowerCase();
    const password = input?.password;
    const repeatPassword = input?.repeatPassword;

    if (!email || !password || !repeatPassword) {
      throw new BadRequestException(
        'Email, password and repeatPassword are required.',
      );
    }

    if (password !== repeatPassword) {
      throw new BadRequestException('Passwords do not match.');
    }

    if (!prenom || !nom) {
      throw new BadRequestException('Prenom and nom are required.');
    }

    if (password.length < 8) {
      throw new BadRequestException(
        'Password must be at least 8 characters long.',
      );
    }

    let utilisateur: Utilisateur;
    try {
      utilisateur = await this.prisma.utilisateur.create({
        data: {
          email,
          motDePasse: this.hashPassword(password),
          prenom,
          nom,
        },
      });
    } catch (error: unknown) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException(
          'An account with this email already exists.',
        );
      }

      throw error;
    }

    return {
      data: {
        accessToken: this.buildAccessToken(utilisateur),
        user: this.sanitizeUser(utilisateur),
      },
    };
  }

  private hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = scryptSync(password, salt, 64).toString('hex');
    return `scrypt:${salt}:${derivedKey}`;
  }

  private isPasswordValid(
    plainPassword: string,
    storedPassword: string | null,
  ): boolean {
    if (!storedPassword) {
      return false;
    }

    if (storedPassword.startsWith('scrypt:')) {
      const [, salt, storedDigest] = storedPassword.split(':');
      if (!salt || !storedDigest) {
        return false;
      }

      const computedDigest = scryptSync(plainPassword, salt, 64).toString(
        'hex',
      );
      return timingSafeEqual(
        Buffer.from(computedDigest, 'hex'),
        Buffer.from(storedDigest, 'hex'),
      );
    }

    return plainPassword === storedPassword;
  }

  private buildAccessToken(utilisateur: Utilisateur): string {
    const secret = process.env.AUTH_TOKEN_SECRET ?? 'dev-sign-in-secret';
    const payload = `${utilisateur.idUtilisateur}:${utilisateur.email}:${Date.now()}`;

    return createHmac('sha256', secret).update(payload).digest('hex');
  }

  private sanitizeUser(utilisateur: Utilisateur): SignedInUser {
    const { motDePasse, ...safeUser } = utilisateur;
    void motDePasse;
    return safeUser;
  }

  private isUniqueConstraintError(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    return Reflect.get(error, 'code') === 'P2002';
  }
}
