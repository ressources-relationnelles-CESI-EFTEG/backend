import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

export interface TestApp {
  app: INestApplication;
  prisma: PrismaService;
}

/**
 * Creates a NestJS test application with:
 *  - ThrottlerGuard disabled (prevents rate-limit interference in tests)
 *  - ValidationPipe configured identically to main.ts
 */
export async function createTestApp(): Promise<TestApp> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideGuard(ThrottlerGuard)
    .useValue({ canActivate: () => true })
    .compile();

  const app = moduleRef.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();

  const prisma = moduleRef.get<PrismaService>(PrismaService);
  return { app, prisma };
}

/**
 * Truncates all application tables in dependency-safe order and resets
 * auto-increment sequences. Call in beforeEach / afterAll.
 */
export async function truncateAll(prisma: PrismaService): Promise<void> {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      message,
      participant_conversation,
      conversation,
      signalement,
      ami,
      progression,
      favori,
      ressource_tag,
      commentaire,
      ressource,
      tag,
      categorie,
      utilisateur
    RESTART IDENTITY CASCADE
  `);
}
