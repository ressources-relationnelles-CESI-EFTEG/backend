# Backend (NestJS + Prisma + PostgreSQL Docker)

Ce backend utilise NestJS + Prisma. La base PostgreSQL tourne dans Docker.

## Prerequis (Windows)

- Docker Desktop (WSL2 active)
- Node.js LTS (v20+)
- Git

## Setup rapide

Depuis `backend/` (PowerShell):

```powershell
Copy-Item .env.example .env
npm install
npm run db:up
npm run prisma:generate
npx prisma migrate deploy
npm run start:dev
```

API Nest: `http://localhost:3000`

## Base de donnees sans outil externe

Prisma Studio:

```powershell
npm run prisma:studio
```

## Commandes utiles

```powershell
npm run db:up      # demarre PostgreSQL
npm run db:down    # stoppe PostgreSQL
npm run db:reset   # stoppe + supprime les donnees
npm run db:logs    # logs PostgreSQL
```

## Seed (optionnel)

```powershell
npx prisma db seed
```
