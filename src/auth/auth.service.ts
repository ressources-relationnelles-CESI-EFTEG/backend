import { compare, genSalt, hash } from 'bcryptjs';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac } from 'crypto';
import { StatutUtilisateur, type Utilisateur } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import type {
  LoginResponse,
  LoginResponseUser,
  RegisterResponse,
} from './auth.types';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(input: LoginDto): Promise<LoginResponse> {
    const email = input?.email?.trim().toLowerCase();
    const password = input?.password;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required.');
    }

    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { email },
    });

    if (!utilisateur || utilisateur.statut !== StatutUtilisateur.ACTIF) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const validPassword = await this.isPasswordValid(
      password,
      utilisateur.motDePasse,
    );
    if (!validPassword) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    return {
      accessToken: this.buildAccessToken(utilisateur),
      refreshToken: this.buildAccessToken(utilisateur),
      user: this.toLoginUser(utilisateur),
    };
  }

  async register(input: RegisterDto): Promise<RegisterResponse> {
    const firstname = input?.firstname?.trim();
    const lastname = input?.lastname?.trim();
    const email = input?.email?.trim().toLowerCase();
    const password = input?.password;
    const confirmPassword = input?.confirmPassword;

    if (!email || !password || !confirmPassword) {
      throw new BadRequestException(
        'Email, password and confirmPassword are required.',
      );
    }

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match.');
    }

    if (!firstname || !lastname) {
      throw new BadRequestException('Firstname and lastname are required.');
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
          motDePasse: await this.hashPassword(password),
          prenom: firstname,
          nom: lastname,
        },
      });
    } catch (error: unknown) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException("L'email est déjà utilisé");
      }
      throw error;
    }

    return {
      message: 'Compte créé avec succès',
      user: this.toLoginUser(utilisateur),
    };
  }

  verifyToken(token: string): { userId: number; email: string } | null {
    const secret = process.env.AUTH_TOKEN_SECRET ?? 'dev-sign-in-secret';
    const dotIndex = token.lastIndexOf('.');
    if (dotIndex === -1) return null;

    const payloadB64 = token.substring(0, dotIndex);
    const signature = token.substring(dotIndex + 1);

    const expectedSig = createHmac('sha256', secret)
      .update(payloadB64)
      .digest('hex');
    if (signature !== expectedSig) return null;

    try {
      const payload = Buffer.from(payloadB64, 'base64url').toString();
      const parts = payload.split(':');
      const userIdStr = parts[0];
      const email = parts[1];
      const issuedAt = Number(parts[2]);
      const userId = Number(userIdStr);
      if (!Number.isInteger(userId) || !email || !issuedAt) return null;

      const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h
      if (Date.now() - issuedAt > TOKEN_TTL_MS) return null;

      return { userId, email };
    } catch {
      return null;
    }
  }

  private toLoginUser(utilisateur: Utilisateur): LoginResponseUser {
    return {
      id: utilisateur.idUtilisateur,
      firstname: utilisateur.prenom,
      lastname: utilisateur.nom,
      email: utilisateur.email,
      role: utilisateur.role.toLowerCase(),
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(10);
    return hash(password, salt);
  }

  private async isPasswordValid(
    plainPassword: string,
    storedPassword: string | null,
  ): Promise<boolean> {
    if (!storedPassword) return false;
    return compare(plainPassword, storedPassword);
  }

  private buildAccessToken(utilisateur: Utilisateur): string {
    const secret = process.env.AUTH_TOKEN_SECRET ?? 'dev-sign-in-secret';
    const payload = `${utilisateur.idUtilisateur}:${utilisateur.email}:${Date.now()}`;
    const payloadB64 = Buffer.from(payload).toString('base64url');
    const signature = createHmac('sha256', secret)
      .update(payloadB64)
      .digest('hex');

    return `${payloadB64}.${signature}`;
  }

  private isUniqueConstraintError(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    return Reflect.get(error, 'code') === 'P2002';
  }
}
