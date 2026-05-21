# Ressources Relationnelles — Backend

[![CI](https://github.com/ressources-relationnelles-CESI-EFTEG/backend/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/ressources-relationnelles-CESI-EFTEG/backend/actions/workflows/ci.yml)
[![CodeQL](https://github.com/ressources-relationnelles-CESI-EFTEG/backend/actions/workflows/github-code-scanning/codeql/badge.svg?branch=main)](https://github.com/ressources-relationnelles-CESI-EFTEG/backend/actions/workflows/github-code-scanning/codeql)
[![Latest Release](https://img.shields.io/github/v/release/ressources-relationnelles-CESI-EFTEG/backend?label=release&color=blue)](https://github.com/ressources-relationnelles-CESI-EFTEG/backend/releases)
[![Licence Ouverte 2.0](https://img.shields.io/badge/Licence-Ouverte_2.0_(Etalab)-000091)](./LICENSE)

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![Node](https://img.shields.io/badge/Node-20%2B-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)

API REST NestJS pour la plateforme Ressources (Re)lationnelles. Gère l'authentification, les comptes utilisateurs, les ressources et leurs catégories / tags, les commentaires, les favoris, les progressions, les signalements, la messagerie interne et la gestion d'amitié.

## Prérequis

- Node.js ≥ 20, npm ≥ 10
- Docker Desktop (pour PostgreSQL)

## Installation

```bash
npm install
cp .env.example .env
# Éditer .env avec vos valeurs
```

### Variables d'environnement (`.env`)

```
DATABASE_URL="postgresql://test:test@127.0.0.1:5433/rr_cesi"
AUTH_TOKEN_SECRET="votre-secret-ici"
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

## Base de données

```bash
npm run db:up              # Démarrer PostgreSQL (port 5433, conteneur rr-cesi-db)
npm run db:down            # Arrêter
npm run db:reset           # Supprimer les volumes (reset complet)
npx prisma migrate deploy  # Appliquer les migrations
npx ts-node prisma/seed.ts # Insérer les données de démonstration
```

## Démarrage

```bash
npm run start:dev    # Mode développement (hot reload) — http://localhost:3001
npm run start:prod   # Mode production
npm run build        # Compiler TypeScript
```

## Tests

```bash
npm run test            # Tests unitaires (services + guards)
npm run test:watch      # Mode watch (TDD)
npm run test:cov        # Rapport de couverture
npm run test:db:up      # Démarrer la base de test (port 5434)
npm run test:e2e:setup  # Appliquer les migrations sur la base de test
npm run test:e2e        # Tests E2E (Supertest + PostgreSQL réel)
npm run test:ci         # Suite complète CI : unitaires + couverture + E2E
```

## Structure des modules

```
src/
  auth/            Authentification JWT maison (sign-in, sign-up, guards, rôles)
  utilisateurs/    Comptes utilisateurs (profil, photo, rôle, statut)
  ressources/      Ressources pédagogiques (CRUD, modération, visibilité)
  categories/      Catégories (hiérarchie parent/enfant)
  tags/            Tags et association ressource ↔ tag
  commentaires/    Commentaires et réponses (modération)
  favoris/         Favoris utilisateurs
  progressions/    Suivi de progression (exploitée / mise de côté)
  signalements/    Signalements utilisateurs (ressources, commentaires)
  messagerie/      Conversations et messages privés
  amis/            Demandes d'amitié et liens d'amitié
  prisma/          Service Prisma partagé
```

## Authentification

Token JWT HMAC-SHA256 personnalisé : `base64url(userId:email:timestamp).signature`
- Expiration : 24 h
- Header requis : `Authorization: Bearer <token>`
- Rôles : `CITOYEN`, `MODERATEUR`, `ADMINISTRATEUR`, `SUPER_ADMIN`

## Comptes de démonstration (seed)

Tous les comptes utilisent le même mot de passe : `Password123!`

| Rôle | Email |
|------|-------|
| Super administrateur | superadmin@rr.local |
| Administrateur | admin@rr.local |
| Modérateur | moderateur@rr.local |
| Citoyen | citoyen@rr.local |

## Endpoints API

### Authentification `/auth`

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/auth/sign-up` | Créer un compte |
| POST | `/auth/sign-in` | Se connecter, renvoie un `accessToken` |

### Utilisateurs `/utilisateurs`

| Méthode | Route | Description | Rôles requis |
|---------|-------|-------------|--------------|
| GET | `/utilisateurs` | Lister les utilisateurs (`?search=` pour filtrer) | ADMINISTRATEUR, SUPER_ADMIN |
| GET | `/utilisateurs/search?q=` | Recherche pour la messagerie (prénom / nom / email) | Authentifié |
| GET | `/utilisateurs/:id` | Profil d'un utilisateur | Authentifié |
| PATCH | `/utilisateurs/:id` | Modifier un utilisateur | Authentifié |
| PATCH | `/utilisateurs/:id/statut` | Changer le statut (ACTIF, INACTIF, SUSPENDU) | ADMINISTRATEUR, SUPER_ADMIN |
| PATCH | `/utilisateurs/:id/role` | Changer le rôle | ADMINISTRATEUR, SUPER_ADMIN |
| POST | `/utilisateurs/:id/photo` | Upload photo de profil (form-data, champ `photo`) | Authentifié |
| DELETE | `/utilisateurs/:id/photo` | Supprimer la photo de profil | Authentifié |
| DELETE | `/utilisateurs/:id` | Supprimer un utilisateur | ADMINISTRATEUR, SUPER_ADMIN |

### Ressources `/ressources`

| Méthode | Route | Description | Rôles requis |
|---------|-------|-------------|--------------|
| GET | `/ressources` | Lister les ressources publiques validées (`?categorie=`) | Tous |
| GET | `/ressources/:id` | Détail d'une ressource | Tous |
| GET | `/ressources/utilisateur/:id` | Ressources créées par un utilisateur (tous statuts) | Tous |
| POST | `/ressources` | Créer une ressource | Authentifié |
| PATCH | `/ressources/:id` | Modifier une ressource (modération : valider / rejeter) | MODERATEUR, ADMINISTRATEUR, SUPER_ADMIN |
| DELETE | `/ressources/:id` | Supprimer une ressource | MODERATEUR, ADMINISTRATEUR, SUPER_ADMIN |

### Catégories `/categories`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/categories` | Lister toutes les catégories (avec enfants) |
| GET | `/categories/:id` | Détail d'une catégorie |
| POST | `/categories` | Créer une catégorie |
| PATCH | `/categories/:id` | Modifier une catégorie |
| DELETE | `/categories/:id` | Supprimer une catégorie |

### Commentaires `/commentaires`

| Méthode | Route | Description | Rôles requis |
|---------|-------|-------------|--------------|
| GET | `/commentaires/ressource/:id` | Commentaires d'une ressource (racines + réponses) | Tous |
| GET | `/commentaires/:id` | Détail d'un commentaire | Tous |
| POST | `/commentaires` | Créer un commentaire ou une réponse | Authentifié |
| PATCH | `/commentaires/:id` | Modifier un commentaire (modération) | MODERATEUR, ADMINISTRATEUR, SUPER_ADMIN |
| DELETE | `/commentaires/:id` | Supprimer un commentaire | MODERATEUR, ADMINISTRATEUR, SUPER_ADMIN |

### Favoris `/favoris`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/favoris/utilisateur/:id` | Favoris d'un utilisateur |
| GET | `/favoris/:userId/:ressourceId` | Vérifier si une ressource est en favori |
| POST | `/favoris/:userId/:ressourceId` | Ajouter aux favoris |
| DELETE | `/favoris/:userId/:ressourceId` | Retirer des favoris |

### Tags `/tags`

| Méthode | Route | Description | Rôles requis |
|---------|-------|-------------|--------------|
| GET | `/tags` | Lister tous les tags | Tous |
| GET | `/tags/:id` | Détail d'un tag | Tous |
| POST | `/tags` | Créer un tag | ADMINISTRATEUR, SUPER_ADMIN |
| DELETE | `/tags/:id` | Supprimer un tag | ADMINISTRATEUR, SUPER_ADMIN |
| POST | `/tags/ressource/:ressourceId/:tagId` | Associer un tag à une ressource | ADMINISTRATEUR, SUPER_ADMIN |
| DELETE | `/tags/ressource/:ressourceId/:tagId` | Retirer un tag d'une ressource | ADMINISTRATEUR, SUPER_ADMIN |

### Signalements `/signalements`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/signalements` | Lister les signalements (`?statut=` pour filtrer) |
| GET | `/signalements/:id` | Détail d'un signalement |
| POST | `/signalements` | Créer un signalement |
| PATCH | `/signalements/:id` | Traiter un signalement (renseigne `dateTraitement`) |
| DELETE | `/signalements/:id` | Supprimer un signalement |

### Messagerie `/messagerie`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/messagerie/conversations/utilisateur/:id` | Conversations d'un utilisateur + dernier message |
| GET | `/messagerie/conversations/:id` | Détail d'une conversation + participants |
| GET | `/messagerie/conversations/:id/messages` | Messages d'une conversation (ASC) |
| GET | `/messagerie/non-lus/:id` | Nombre total de messages non lus (`{ nonLus }`) |
| POST | `/messagerie/conversations` | Créer une conversation (body `{ participantIds: number[] }`) |
| POST | `/messagerie/conversations/:id/messages` | Envoyer un message (auteur pris du JWT) |
| PATCH | `/messagerie/conversations/:id/lu/:userId` | Marquer comme lus les messages des autres |
| DELETE | `/messagerie/conversations/:id` | Quitter la conversation (supprimée si dernier participant) |
| DELETE | `/messagerie/conversations/:id/participants/me` | Alias explicite de « quitter » |
| DELETE | `/messagerie/messages/:idMessage` | Supprimer un message (auteur uniquement) |

### Amis `/amis`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/amis/utilisateur/:id` | Liste des amis |
| GET | `/amis/demandes/recues/:id` | Demandes reçues en attente |
| GET | `/amis/demandes/envoyees/:id` | Demandes envoyées en attente |
| POST | `/amis/:userId1/:userId2` | Envoyer une demande d'amitié |
| PATCH | `/amis/accepter/:userId1/:userId2` | Accepter une demande |
| PATCH | `/amis/refuser/:userId1/:userId2` | Refuser une demande |
| DELETE | `/amis/:userId1/:userId2` | Supprimer une amitié |

### Progressions `/progressions`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/progressions/utilisateur/:id` | Progressions d'un utilisateur (`?type=` pour filtrer) |
| GET | `/progressions/:id` | Détail d'une progression |
| POST | `/progressions` | Créer une progression |
| PATCH | `/progressions/:id` | Modifier une progression |
| DELETE | `/progressions/:id` | Supprimer une progression |

## Licence

Ce projet est distribué sous **[Licence Ouverte 2.0 (Etalab)](./LICENSE)** — la licence officielle de l'État français pour les codes sources et données publiques, conçue pour le secteur public et compatible avec les licences CC-BY, ODC-BY et OGL.

Vous pouvez librement réutiliser, modifier, redistribuer et exploiter ce code, y compris à des fins commerciales, sous la seule condition de mentionner la paternité (source : *Ressources Relationnelles — CESI EFTEG*) et la date de dernière mise à jour de l'information réutilisée.

Choix motivé par le contexte ministériel du projet : la Licence Ouverte est notamment retenue par `data.gouv.fr`, Etalab, beta.gouv.fr et le SocialGouv.
