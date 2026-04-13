import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { RoleUtilisateur } from '@prisma/client';

import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from './roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { asPrismaService, createPrismaMock, type PrismaMock } from '../test-utils/prisma.mock';

function makeContext(user?: { userId: number; email: string }): ExecutionContext {
  const request: Record<string, unknown> = user ? { user } : {};

  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        Reflector,
        { provide: PrismaService, useValue: asPrismaService(prisma) },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => jest.restoreAllMocks());

  it("retourne true si aucun role n'est requis (decorateur absent)", async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const ctx = makeContext({ userId: 1, email: 'a@b.com' });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it("retourne true si le tableau de roles requis est vide", async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
    const ctx = makeContext({ userId: 1, email: 'a@b.com' });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it("leve ForbiddenException si request.user est absent", async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMINISTRATEUR']);
    const ctx = makeContext();

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it("leve ForbiddenException si l'utilisateur est introuvable en DB", async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMINISTRATEUR']);
    prisma.utilisateur.findUnique.mockResolvedValue(null);
    const ctx = makeContext({ userId: 99, email: 'ghost@example.com' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it("leve ForbiddenException si le role de l'utilisateur n'est pas dans la liste", async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMINISTRATEUR']);
    prisma.utilisateur.findUnique.mockResolvedValue({ role: RoleUtilisateur.CITOYEN });
    const ctx = makeContext({ userId: 1, email: 'user@example.com' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it("retourne true si le role de l'utilisateur est dans la liste autorisee", async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMINISTRATEUR']);
    prisma.utilisateur.findUnique.mockResolvedValue({ role: RoleUtilisateur.ADMINISTRATEUR });
    const ctx = makeContext({ userId: 2, email: 'admin@example.com' });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it("autorise SUPER_ADMIN quand le role requis est SUPER_ADMIN", async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['SUPER_ADMIN']);
    prisma.utilisateur.findUnique.mockResolvedValue({ role: RoleUtilisateur.SUPER_ADMIN });
    const ctx = makeContext({ userId: 3, email: 'superadmin@example.com' });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it("verifie la cle ROLES_KEY sur handler et classe", async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
    const ctx = makeContext({ userId: 1, email: 'a@b.com' });

    await guard.canActivate(ctx);

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
  });

  it("interroge prisma avec idUtilisateur et select role seulement", async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['MODERATEUR']);
    prisma.utilisateur.findUnique.mockResolvedValue({ role: RoleUtilisateur.MODERATEUR });
    const ctx = makeContext({ userId: 5, email: 'm@example.com' });

    await guard.canActivate(ctx);

    expect(prisma.utilisateur.findUnique).toHaveBeenCalledWith({
      where: { idUtilisateur: 5 },
      select: { role: true },
    });
  });
});
