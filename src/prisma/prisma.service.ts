import 'dotenv/config';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        'Missing DATABASE_URL. Add it to backend/.env before starting Nest.',
      );
    }

    let PrismaPg: new (options: { connectionString: string }) => unknown;
    try {
      ({ PrismaPg } = require('@prisma/adapter-pg'));
    } catch {
      throw new Error(
        'Missing dependency @prisma/adapter-pg. Run: npm i @prisma/adapter-pg pg',
      );
    }

    const adapter = new PrismaPg({ connectionString });
    super({ adapter: adapter as never });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
