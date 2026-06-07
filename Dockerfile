# syntax=docker/dockerfile:1.7

# -----------------------------------------------------------------------------
# Stage 1 — Builder
# Compile TypeScript NestJS et génère le client Prisma.
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Outils nécessaires à la génération du client Prisma sur Alpine
RUN apk add --no-cache openssl

# Installer les dépendances en exploitant le cache Docker (package*.json en premier)
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund

# Copier le reste du code source et builder
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npx prisma generate
RUN npm run build

# Trim node_modules à ce qui est nécessaire à l'exécution
RUN npm prune --omit=dev


# -----------------------------------------------------------------------------
# Stage 2 — Runtime
# Image minimale qui exécute l'API compilée.
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

# dumb-init : propage correctement les signaux SIGTERM/SIGINT à Node
RUN apk add --no-cache dumb-init openssl

# Copier uniquement ce qui est utile à la production
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Créer le dossier d'uploads (monté en volume en preprod/prod)
RUN mkdir -p /app/uploads && chown -R node:node /app

# Exécution en utilisateur non-root
USER node

EXPOSE 3001

# Healthcheck interne (à doubler avec un healthcheck Compose niveau service)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
