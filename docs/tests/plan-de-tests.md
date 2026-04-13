# Plan de Tests — Backend Ressources Relationnelles

**Projet** : Ressources Relationnelles (CDA — Cas H2O V2)
**Module** : Backend NestJS
**Version** : 1.0
**Date** : 2026-04-13
**Auteur** : Equipe Backend

---

## 1. Objectifs

Garantir la qualite, la fiabilite et la maintenabilite du backend en couvrant trois niveaux de tests :

| Niveau | Outil | Perimetre |
|---|---|---|
| Tests unitaires | Jest + mocks Prisma | Logique metier des services et gardes |
| Tests d'integration (e2e) | Jest + supertest + DB reelle | Flux HTTP complets |
| Tests de non-regression | CI GitHub Actions | Prevention de regression a chaque push |

---

## 2. Perimetre

### 2.1 Dans le scope

- **11 modules fonctionnels** : auth, utilisateurs, ressources, categories, tags, commentaires, favoris, progressions, signalements, amis, messagerie
- **Gardes** : AuthGuard (token HMAC), RolesGuard (roles utilisateur)
- **Upload fichiers** : photo de profil (multer)
- **Throttling** : limitation de debit (@nestjs/throttler)

### 2.2 Hors scope

- Frontend / application mobile
- Infrastructure de production (k8s, CDN, DNS)
- Tests de performance / charge

---

## 3. Environnements

| Environnement | Base de donnees | Port | Usage |
|---|---|---|---|
| Developpement | PostgreSQL 16 (Docker) | 5433 | Dev local |
| Test | PostgreSQL 16 (Docker) | 5434 | Tests e2e locaux |
| CI | PostgreSQL 16 (service GitHub Actions) | 5434 | Pipeline automatise |

### Variables d'environnement de test

```
DATABASE_URL=postgresql://test:test@127.0.0.1:5434/rr_cesi_test
AUTH_TOKEN_SECRET=test-secret
```

---

## 4. Outils

| Outil | Version | Role |
|---|---|---|
| Jest | 30.x | Framework de test (unit + e2e) |
| @nestjs/testing | 11.x | Module de test NestJS |
| supertest | 7.x | Appels HTTP dans les tests e2e |
| ts-jest | 29.x | Compilation TypeScript pour Jest |
| Docker / docker-compose | 20+ | Base de donnees de test isolee |
| GitHub Actions | — | CI/CD |

---

## 5. Strategie par niveau

### 5.1 Tests unitaires (`src/**/*.spec.ts`)

- Chaque service a son fichier `.spec.ts` colocalise.
- `PrismaService` est mocke via `createPrismaMock()` (`src/test-utils/prisma.mock.ts`).
- Aucun acces reseau ni base de donnees reelle.
- Fixtures partagees dans `src/test-utils/fixtures.ts`.
- Isolation : `jest.clearAllMocks()` dans `afterEach`.

**Fichiers couverts** :
`auth.service`, `auth.guard`, `roles.guard`, `utilisateurs.service`, `ressources.service`, `categories.service`, `tags.service`, `commentaires.service`, `favoris.service`, `progressions.service`, `signalements.service`, `amis.service`, `messagerie.service`

### 5.2 Tests d'integration e2e (`test/*.e2e-spec.ts`)

- `AppModule` complet instancie via `createTestApp()` (helper e2e).
- `ThrottlerGuard` desactive pour eviter les faux positifs de rate-limiting.
- `ValidationPipe` avec `whitelist + forbidNonWhitelisted + transform` replique la config de `main.ts`.
- Chaque suite isole son etat via `truncateAll(prisma)` dans `beforeEach`.
- Execution sequentielle (`--runInBand`) pour eviter les conflits de DB.

**Suites couverts** :
`auth`, `utilisateurs`, `ressources`, `categories`, `messagerie`, `amis`, `signalements`, `upload`

### 5.3 Tests de non-regression (CI)

- Declenche automatiquement sur tout push / PR ciblant `main` et modifiant `backend/`.
- Deux jobs independants : `unit` (avec coverage) et `e2e` (avec Postgres service container).
- Rapport de coverage archive comme artefact GitHub Actions (14 jours).

---

## 6. Criteres d'entree

- Code review approuvee (PR mergeable)
- Schema Prisma valide (`prisma validate`)
- Build TypeScript sans erreur (`nest build`)
- Base de test accessible (Docker ou CI service container)

## 7. Criteres de sortie

| Critere | Seuil |
|---|---|
| Tests unitaires | 100 % verts |
| Couverture services (`src/**/*.service.ts`) | >= 70 % branches |
| Couverture gardes (`auth.guard`, `roles.guard`) | >= 90 % |
| Tests e2e happy-path | 0 echec |
| Tests e2e scenarios d'erreur (40x) | 0 echec |

---

## 8. Responsabilites

| Role | Responsabilite |
|---|---|
| Developpeur | Ecriture des tests unitaires et e2e, maintenance des fixtures |
| Tech Lead | Validation des criteres de couverture, revue des nouveaux cas |
| DevOps | Maintenance du pipeline CI et de la base de test Docker |

---

## 9. Risques

| Risque | Impact | Mitigation |
|---|---|---|
| Derive de la DB de test | E2e faux positifs | `truncateAll` + `RESTART IDENTITY` entre chaque test |
| Token HMAC expire en CI | Echec auth | Token genere dynamiquement dans `buildToken()` |
| Ports Docker en conflit | CI/local | Port 5434 dedie aux tests, distinct du port dev 5433 |
| Lenteur des e2e en CI | Feedback trop lent | `--runInBand` + Postgres health-check avant les migrations |
