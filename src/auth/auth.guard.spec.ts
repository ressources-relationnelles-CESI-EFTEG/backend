import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthGuard, IS_PUBLIC_KEY } from './auth.guard';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { asPrismaService, createPrismaMock } from '../test-utils/prisma.mock';

function makeContext(authHeader: string | undefined): ExecutionContext {
  const request: Record<string, any> = { headers: {} };
  if (authHeader !== undefined) {
    request.headers['authorization'] = authHeader;
  }

  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: AuthService;
  let reflector: Reflector;

  beforeEach(async () => {
    const prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        AuthService,
        Reflector,
        { provide: PrismaService, useValue: asPrismaService(prisma) },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    authService = module.get<AuthService>(AuthService);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => jest.restoreAllMocks());

  it("laisse passer une route marquee @Public() sans verifier le token", () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const ctx = makeContext(undefined);

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("leve UnauthorizedException si le header Authorization est absent", () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const ctx = makeContext(undefined);

    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('leve UnauthorizedException si le prefixe n\'est pas "Bearer "', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const ctx = makeContext('Token abc123');

    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it("leve UnauthorizedException si le token est invalide", () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    jest.spyOn(authService, 'verifyToken').mockReturnValue(null);
    const ctx = makeContext('Bearer invalid.token');

    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it("retourne true et injecte request.user si le token est valide", () => {
    const payload = { userId: 7, email: 'user@example.com' };
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    jest.spyOn(authService, 'verifyToken').mockReturnValue(payload);

    const ctx = makeContext('Bearer valid.token');
    const result = guard.canActivate(ctx);

    expect(result).toBe(true);
    const request = ctx.switchToHttp().getRequest() as any;
    expect(request.user).toEqual(payload);
  });

  it("lit la cle IS_PUBLIC_KEY depuis le handler et la classe", () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    jest.spyOn(authService, 'verifyToken').mockReturnValue({ userId: 1, email: 'a@b.com' });
    const ctx = makeContext('Bearer t.ok');

    guard.canActivate(ctx);

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
  });
});
