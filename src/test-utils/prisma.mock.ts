import type { PrismaService } from '../prisma/prisma.service';

type ModelMethods =
  | 'findUnique'
  | 'findFirst'
  | 'findMany'
  | 'create'
  | 'update'
  | 'delete'
  | 'deleteMany'
  | 'updateMany'
  | 'count'
  | 'upsert';

const MODELS = [
  'utilisateur',
  'ressource',
  'categorie',
  'tag',
  'ressourceTag',
  'commentaire',
  'favori',
  'progression',
  'signalement',
  'conversation',
  'participantConversation',
  'message',
  'ami',
] as const;

const METHODS: ModelMethods[] = [
  'findUnique',
  'findFirst',
  'findMany',
  'create',
  'update',
  'delete',
  'deleteMany',
  'updateMany',
  'count',
  'upsert',
];

export type PrismaMock = {
  [K in (typeof MODELS)[number]]: {
    [M in ModelMethods]: jest.Mock;
  };
} & {
  $transaction: jest.Mock;
  $connect: jest.Mock;
  $disconnect: jest.Mock;
};

/**
 * Build a fully-mocked PrismaService usable as a Nest provider:
 *   { provide: PrismaService, useValue: createPrismaMock() }
 */
export function createPrismaMock(): PrismaMock {
  const mock: any = {
    $transaction: jest.fn((cb: any) =>
      typeof cb === 'function' ? cb(mock) : cb,
    ),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  for (const model of MODELS) {
    mock[model] = {};
    for (const method of METHODS) {
      mock[model][method] = jest.fn();
    }
  }

  return mock as PrismaMock;
}

/** Cast helper for usage as PrismaService in providers arrays. */
export const asPrismaService = (mock: PrismaMock): PrismaService =>
  mock as unknown as PrismaService;
