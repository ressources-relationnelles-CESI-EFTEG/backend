# Plan de déploiement — Ressources Relationnelles Backend

## Architecture générale

```
                        Réseau Docker : rr-net
        ┌────────────────────────────────────────────────────┐
        │                                                    │
[Mobile Flutter] ─┐                                          │
                  ├──→ [Frontend Nuxt :3000] ──→ [Backend NestJS :3001] ──→ [PostgreSQL :5432]
[Browser]    ────┘                                                │                 │
                                                        src/: 11 modules      service "db"
                                                        (auth, utilisateurs,  (docker-
                                                         ressources, etc.)    compose)
        │                                                    │
        └────────────────────────────────────────────────────┘
```

> Les trois repos (`backend`, `frontend-nuxt`, `mobile-flutter`) sont des projets Git indépendants.
> Le backend expose une API REST documentée via Swagger (`/api` — activable via `SWAGGER_ENABLED`).

---

## Environnements

| Environnement | Mode de lancement | Base de données | Port DB |
|---------------|-------------------|-----------------|---------|
| Développement | `npm run start:dev` (Node.js direct) | `docker-compose.yml` | 5433 |
| Test | `npm run test:e2e` | `docker-compose.test.yml` | 5434 |
| Production | Docker (`docker-compose.prod.yml`) | Service `db` interne | 5432 |

### Développement local

```bash
# Démarrer la base de données de développement
npm run db:up

# Appliquer les migrations
npx prisma migrate deploy

# Insérer les données de démonstration
npx ts-node prisma/seed.ts

# Lancer le serveur en mode watch
npm run start:dev
```

Accès : `http://localhost:3001`

### Tests E2E

```bash
# Démarrer la base de données de test
npm run test:db:up

# Appliquer les migrations sur la base de test
npm run test:e2e:setup

# Exécuter les tests E2E
npm run test:e2e

# Ou suite complète : unitaires + couverture + E2E
npm run test:ci
```

---

## Prérequis

- **Node.js** ≥ 20
- **npm** ≥ 10
- **Docker** 24+
- **Docker Compose** v2 (`docker compose` — sans tiret)
- **Git**

---

## Déploiement local (production-like)

### 1. Créer le réseau partagé (une seule fois)

```bash
docker network create rr-net
```

### 2. Déployer le backend

```bash
cd backend

# Copier et configurer les variables d'environnement
cp .env.example .env.production

# Éditer .env.production avec des valeurs fortes :
#   NODE_ENV=production
#   PORT=3001
#   DATABASE_URL=postgresql://rr_user:motdepassefort@db:5432/rr_prod
#   AUTH_TOKEN_SECRET=<secret-fort-64-chars-via-openssl>
#   AUTH_TOKEN_EXPIRATION=24
#   CORS_ORIGIN=http://localhost:3000
#   THROTTLE_TTL=60
#   THROTTLE_LIMIT=20
#   THROTTLE_AUTH_LIMIT=5
#   SWAGGER_ENABLED=false
#   POSTGRES_USER=rr_user
#   POSTGRES_PASSWORD=<mot-de-passe-fort>
#   POSTGRES_DB=rr_prod

# Construire et démarrer
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

> Les migrations Prisma sont appliquées automatiquement au démarrage via `docker-entrypoint.sh`.

### 3. Déployer le frontend et l'app mobile

Voir `frontend-nuxt/docs/DEPLOYMENT.md` et `mobile-flutter/docs/DEPLOYMENT.md`.

### 4. Seed — données de démonstration (optionnel)

```bash
docker compose -f docker-compose.prod.yml exec api npm run seed
```

Comptes créés par le seed :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Super administrateur | superadmin@rr.local | Password123! |
| Administrateur | admin@rr.local | Password123! |
| Modérateur | moderateur@rr.local | Password123! |
| Citoyen | citoyen@rr.local | Password123! |

> En production, modifier obligatoirement ces mots de passe.

---

## Variables d'environnement

| Variable | Rôle | Obligatoire | Défaut |
|----------|------|:-----------:|--------|
| `NODE_ENV` | Mode d'exécution (`production`, `development`) | Oui | — |
| `PORT` | Port d'écoute du serveur NestJS | Non | 3001 |
| `DATABASE_URL` | URL de connexion Prisma (PostgreSQL) | Oui | — |
| `POSTGRES_USER` | Utilisateur PostgreSQL | Oui | — |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL | Oui | — |
| `POSTGRES_DB` | Nom de la base de données | Oui | — |
| `AUTH_TOKEN_SECRET` | Clé secrète pour signer les tokens JWT (HMAC-SHA256) — min 64 caractères | Oui | — |
| `AUTH_TOKEN_EXPIRATION` | Durée de validité des tokens en heures | Non | 24 |
| `CORS_ORIGIN` | Origine autorisée pour les requêtes CORS (ex. `http://localhost:3000`) | Oui | — |
| `THROTTLE_TTL` | Fenêtre de rate-limiting en secondes | Non | 60 |
| `THROTTLE_LIMIT` | Requêtes max par fenêtre (endpoints globaux) | Non | 20 |
| `THROTTLE_AUTH_LIMIT` | Requêtes max par fenêtre (endpoints `/auth/*`) | Non | 5 |
| `SWAGGER_ENABLED` | Expose la documentation OpenAPI sur `/api/docs` | Non | true |

### Générer `AUTH_TOKEN_SECRET` fort

```bash
openssl rand -base64 64
# Exemple : VWc3pqL9Ky8mN2jX5zR0fB7tH4vD6wJ1sE3cP9lQ2xM8nY6oI0aK5uG7bF3dC4eL9jH
```

---

## Procédure de rollback

```bash
# Arrêter les conteneurs
docker compose -f docker-compose.prod.yml down

# Lister les tags disponibles (versions taggées)
git tag --sort=-version:refname | head -10

# Revenir à une version antérieure
git checkout v0.1.0

# Redéployer
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Appliquer les migrations si changements de schéma entre les versions
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy
```

---

## Sauvegarde de la base de données

### Sauvegarde manuelle

```bash
docker compose -f docker-compose.prod.yml exec db \
  pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup_$(date +%Y%m%d).sql
```

### Restauration

```bash
docker compose -f docker-compose.prod.yml exec -T db \
  psql -U $POSTGRES_USER $POSTGRES_DB < backup_20260521.sql
```

### Cron de sauvegarde automatique (Linux/Mac)

Ajouter dans `crontab -e` :

```
0 2 * * * /path/to/backup-rr.sh >> /var/log/rr-backup.log 2>&1
```

Exemple de script `backup-rr.sh` :

```bash
#!/bin/bash
set -euo pipefail
cd /path/to/backend

# Export des variables d'environnement
export $(grep -v '^#' .env.production | xargs)

# Sauvegarde
docker compose -f docker-compose.prod.yml exec -T db \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" \
  > "/var/backups/rr/backup_$(date +%Y%m%d_%H%M%S).sql"

# Conserver les 30 derniers backups
find /var/backups/rr/ -name "backup_*.sql" -mtime +30 -delete
```

---

## Option cloud (Scaleway / OVH)

Approche documentée — non exécutée dans ce projet scolaire :

1. **Provisionner un VPS** (ex. Scaleway DEV1-S ou OVH VPS Starter) sous Ubuntu 22.04.
2. **Installer Docker** et Docker Compose v2 sur le VPS.
3. **Construire et pousser l'image** dans un registry (GitHub Container Registry ou Docker Hub) :
   ```bash
   docker build -t ghcr.io/ressources-relationnelles-CESI-EFTEG/backend:latest .
   docker push ghcr.io/ressources-relationnelles-CESI-EFTEG/backend:latest
   ```
4. **Sur le VPS** : cloner le repo, copier `.env.production`, puis :
   ```bash
   docker compose -f docker-compose.prod.yml pull
   docker compose -f docker-compose.prod.yml up -d
   ```
5. **HTTPS** : placer un reverse proxy nginx devant le conteneur `api` et générer un certificat Let's Encrypt via certbot :
   ```bash
   certbot --nginx -d api.rr.gouv.fr
   ```
6. **DNS** : créer un enregistrement `A` pointant `api.rr.gouv.fr` vers l'IP publique du VPS.

---

## CI/CD

### Stratégie GitFlow

Le projet suit un GitFlow à **quatre branches d'intégration** :

```
feat/* | fix/* | chore/* | docs/*
        │
        ▼
     develop ──► preprod ──► main
```

| Branche | Rôle | Déploiement |
|---|---|---|
| `develop` | Intégration des fonctionnalités terminées | Environnement de test / QA |
| `preprod` | Stabilisation et validation finale avant production | Environnement de préproduction (déploiement automatique cible **roadmap V1.1**) |
| `main` | Version stable de production, taguée par release | Environnement de production |

Chaque fusion `develop → preprod` puis `preprod → main` passe par une pull request avec revue de code et validation des status checks.

### Pipeline CI

Le workflow GitHub Actions (`.github/workflows/ci.yml`) est déclenché à chaque push et pull request sur `main`, `preprod` et `develop`. Il exécute les étapes suivantes dans l'ordre :

1. Lint (`eslint`)
2. Tests unitaires (`npm run test`)
3. Tests E2E (`npm run test:e2e`) — avec la base de données de test dockerisée
4. Build de production (`npm run build`)

Un push ne peut être fusionné sur `preprod` ou `main` que si toutes les étapes passent (branch protection rules configurées).
