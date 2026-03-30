import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { userId: number; email: string } | undefined;

    if (!user) {
      throw new ForbiddenException('Accès refusé.');
    }

    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { idUtilisateur: user.userId },
      select: { role: true },
    });

    if (!utilisateur || !requiredRoles.includes(utilisateur.role)) {
      throw new ForbiddenException('Vous n\'avez pas les droits nécessaires.');
    }

    return true;
  }
}
