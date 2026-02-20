import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role, TargetType } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Missing DATABASE_URL in backend/.env');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter: adapter as never });

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cesizen.local' },
    update: {
      firstName: 'Admin',
      lastName: 'Cesizen',
      role: Role.ADMIN,
      isActive: true,
    },
    create: {
      email: 'admin@cesizen.local',
      password: '$2b$10$wA61lQx7ek6f0m4Y2leJQeqlY8i3o6e9mU8Vd8iJv8Rk0m8eK8N7S',
      firstName: 'Admin',
      lastName: 'Cesizen',
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'alice@cesizen.local' },
    update: {
      firstName: 'Alice',
      lastName: 'Martin',
      role: Role.USER,
      isActive: true,
    },
    create: {
      email: 'alice@cesizen.local',
      password: '$2b$10$wA61lQx7ek6f0m4Y2leJQeqlY8i3o6e9mU8Vd8iJv8Rk0m8eK8N7S',
      firstName: 'Alice',
      lastName: 'Martin',
      role: Role.USER,
    },
  });

  const breathing = await prisma.information.upsert({
    where: { slug: 'respiration-anti-stress' },
    update: {
      title: 'Respiration anti-stress',
      content:
        'Exercice simple: inspire 4 secondes, bloque 4 secondes, expire 6 secondes pendant 3 a 5 minutes.',
      isPublished: true,
      sortOrder: 1,
    },
    create: {
      title: 'Respiration anti-stress',
      content:
        'Exercice simple: inspire 4 secondes, bloque 4 secondes, expire 6 secondes pendant 3 a 5 minutes.',
      slug: 'respiration-anti-stress',
      isPublished: true,
      sortOrder: 1,
    },
  });

  const sleep = await prisma.information.upsert({
    where: { slug: 'hygiene-du-sommeil' },
    update: {
      title: 'Hygiene du sommeil',
      content:
        'Couche-toi a heure reguliere, evite les ecrans 1h avant de dormir et reduis la cafeine apres 16h.',
      isPublished: true,
      sortOrder: 2,
    },
    create: {
      title: 'Hygiene du sommeil',
      content:
        'Couche-toi a heure reguliere, evite les ecrans 1h avant de dormir et reduis la cafeine apres 16h.',
      slug: 'hygiene-du-sommeil',
      isPublished: true,
      sortOrder: 2,
    },
  });

  const help = await prisma.information.upsert({
    where: { slug: 'demander-de-laide' },
    update: {
      title: "Demander de l'aide",
      content:
        "Parler a un proche, un professeur ou un professionnel est une demarche utile. En cas d'urgence, contacte le 3114.",
      isPublished: true,
      sortOrder: 3,
    },
    create: {
      title: "Demander de l'aide",
      content:
        "Parler a un proche, un professeur ou un professionnel est une demarche utile. En cas d'urgence, contacte le 3114.",
      slug: 'demander-de-laide',
      isPublished: true,
      sortOrder: 3,
    },
  });

  await prisma.menuItem.deleteMany({
    where: {
      label: {
        in: [
          'Respiration',
          'Sommeil',
          "Demander de l'aide",
          '3114 - Prevention suicide',
        ],
      },
    },
  });

  await prisma.menuItem.createMany({
    data: [
      { label: 'Respiration', sortOrder: 1, informationId: breathing.id },
      { label: 'Sommeil', sortOrder: 2, informationId: sleep.id },
      { label: "Demander de l'aide", sortOrder: 3, informationId: help.id },
      {
        label: '3114 - Prevention suicide',
        sortOrder: 4,
        url: 'https://www.3114.fr/',
      },
    ],
  });

  const ensureEmotion = async (
    label: string,
    level: number,
    color: string,
    iconPath: string,
    parentId: number | null = null,
  ) => {
    const existing = await prisma.emotion.findFirst({
      where: { label, level, parentId },
      select: { id: true },
    });
    if (existing) return existing;
    return prisma.emotion.create({
      data: { label, level, color, iconPath, parentId },
      select: { id: true },
    });
  };

  const joy = await ensureEmotion('Joie', 1, '#F4C542', '/icons/joie.svg');
  const sadness = await ensureEmotion(
    'Tristesse',
    1,
    '#4A90E2',
    '/icons/tristesse.svg',
  );
  const anger = await ensureEmotion(
    'Colere',
    1,
    '#E94E4E',
    '/icons/colere.svg',
  );
  const fear = await ensureEmotion('Peur', 1, '#7E57C2', '/icons/peur.svg');

  await ensureEmotion('Serein', 2, '#F7D97A', '/icons/serein.svg', joy.id);
  await ensureEmotion('Fier', 2, '#E9B949', '/icons/fier.svg', joy.id);
  await ensureEmotion(
    'Decourage',
    2,
    '#6FA8DC',
    '/icons/decourage.svg',
    sadness.id,
  );
  await ensureEmotion('Seul', 2, '#5A8AC6', '/icons/seul.svg', sadness.id);
  await ensureEmotion('Frustre', 2, '#D64545', '/icons/frustre.svg', anger.id);
  await ensureEmotion('Irrite', 2, '#C03A3A', '/icons/irrite.svg', anger.id);
  await ensureEmotion('Inquiet', 2, '#8E6BC9', '/icons/inquiet.svg', fear.id);
  await ensureEmotion('Stress', 2, '#7353BA', '/icons/stress.svg', fear.id);

  const serene = await prisma.emotion.findFirstOrThrow({
    where: { label: 'Serein', level: 2, parentId: joy.id },
    select: { id: true },
  });
  const worried = await prisma.emotion.findFirstOrThrow({
    where: { label: 'Inquiet', level: 2, parentId: fear.id },
    select: { id: true },
  });

  await prisma.trackerEntry.upsert({
    where: {
      userId_dateEntry: {
        userId: user.id,
        dateEntry: new Date('2026-02-18'),
      },
    },
    update: {
      emotionId: serene.id,
      note: 'Bonne journee, je me sens posee.',
    },
    create: {
      userId: user.id,
      emotionId: serene.id,
      note: 'Bonne journee, je me sens posee.',
      dateEntry: new Date('2026-02-18'),
    },
  });

  await prisma.trackerEntry.upsert({
    where: {
      userId_dateEntry: {
        userId: user.id,
        dateEntry: new Date('2026-02-19'),
      },
    },
    update: {
      emotionId: worried.id,
      note: 'Journee chargee avant rendu de projet.',
    },
    create: {
      userId: user.id,
      emotionId: worried.id,
      note: 'Journee chargee avant rendu de projet.',
      dateEntry: new Date('2026-02-19'),
    },
  });

  const existingAudit = await prisma.auditLog.count({
    where: { adminId: admin.id },
  });

  if (existingAudit === 0) {
    await prisma.auditLog.createMany({
      data: [
        {
          adminId: admin.id,
          action: 'PUBLISH_INFORMATION',
          targetType: TargetType.INFORMATION,
          targetId: breathing.id,
        },
        {
          adminId: admin.id,
          action: 'UPDATE_INFORMATION',
          targetType: TargetType.INFORMATION,
          targetId: sleep.id,
        },
      ],
    });
  }
}

void main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
