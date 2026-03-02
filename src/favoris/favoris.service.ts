import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavorisService {
  constructor(private readonly prisma: PrismaService) {}
}
