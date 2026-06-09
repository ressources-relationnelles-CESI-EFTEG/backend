# Plan de sécurisation — Ressources Relationnelles Backend

## Matrice des risques OWASP Top 10

| # | Risque OWASP | Statut | Mesures appliquées dans RR Backend |
|---|---|:---:|---|
| A01 | Broken Access Control | Mitigé | `AuthGuard` + `RolesGuard` globaux sur tous les endpoints. Vérification d'ownership sur `GET/PATCH/DELETE /utilisateurs/:id`. Vérification stricte des rôles (`CITOYEN`, `MODERATEUR`, `ADMINISTRATEUR`, `SUPER_ADMIN`). Les utilisateurs ne peuvent accéder qu'à leurs propres ressources (favoris, conversations, progressions). |
| A02 | Cryptographic Failures | Mitigé | Mots de passe hachés avec `bcryptjs` (salt factor 10). Token d'authentification HMAC-SHA256 signé via secret fort (≥ 64 caractères), format `base64url(userId:email:timestamp).signature`. Expiration 1 h. HTTPS obligatoire en production (nginx + certbot). |
| A03 | Injection | Mitigé | Prisma ORM avec prepared statements — aucune interpolation SQL manuelle. `ValidationPipe` strict activé globalement ; tous les DTOs validés avec `class-validator`. Pas de concaténation de requêtes. |
| A04 | Insecure Design | Mitigé | Architecture modulaire NestJS. Séparation claire des responsabilités (guards, services, contrôleurs). Vérification d'ownership systématique sur les ressources utilisateurs. Anti-énumération sur `POST /auth/sign-up` (réponse identique que l'email existe ou non). |
| A05 | Security Misconfiguration | Mitigé | `helmet` activé avec Content Security Policy (CSP) explicite. CORS restreint à `CORS_ORIGIN` (par défaut `http://localhost:3000` en dev). `NODE_ENV=production` forcé en prod. Secrets exclus du code source (`.env` + `.gitignore`). Swagger exposé uniquement si `SWAGGER_ENABLED=true`. |
| A06 | Vulnerable Components | Surveillance | `npm audit` hebdomadaire recommandé. Dépendances actuelles : NestJS 11, Prisma 7, Node 20 LTS. Dependabot activé sur le repo GitHub pour alertes de vulnérabilités. Mises à jour de sécurité appliquées dans les 48 h. |
| A07 | Authentication Failures | Mitigé | `ThrottlerGuard` : 5 requêtes/minute sur `/auth/*` (configurable via `THROTTLE_AUTH_LIMIT`). Politique de mot de passe : 12 caractères minimum, majuscule, minuscule, chiffre, caractère spécial. Token expiration 1 h. Pas de stockage serveur — stateless via signature HMAC. |
| A08 | Software & Data Integrity Failures | Mitigé | `package-lock.json` versionné dans Git. `npm ci` utilisé en CI/CD (installation déterministe). Images Docker épinglées sur des tags précis (pas de `latest` en prod). Migrations Prisma versionnées. Hashage de tous les mots de passe avant persistance. |
| A09 | Security Logging & Monitoring Failures | Partiel | Logs NestJS sur stdout (formatés, sans tokens ni données personnelles). Endpoint `/health` pour supervision externe (UptimeRobot). Centralisation des logs à prévoir en production (ex. Loki/Grafana + Sentry pour erreurs runtime). |
| A10 | Server-Side Request Forgery (SSRF) | Non applicable | Le backend n'effectue aucun appel HTTP sortant — risque SSRF inexistant. Aucun webhooks sortants implémentés actuellement. |

---

## Matrice des risques (probabilité × impact)

Échelle : Probabilité et Impact notés de 1 à 5. Criticité = Probabilité × Impact. Bandes : 1–5 Faible · 6–9 Moyen · 10–15 Élevé · 16–25 Critique.

| # | Risque / vulnérabilité | Probabilité | Impact | Criticité | Action préventive | Action corrective |
|---|---|:---:|:---:|:---:|---|---|
| R1 | Vol de token JWT via XSS (stocké en `localStorage` côté frontend) | 3 | 5 | 15 — Élevé | `helmet` + CSP stricte, validation inputs côté backend, expiration 1 h | Rotation du `AUTH_TOKEN_SECRET` (invalide tous tokens), patch XSS côté frontend |
| R2 | Attaque brute-force sur `/auth/sign-in` | 4 | 3 | 12 — Élevé | `ThrottlerGuard` 5 req/min sur `/auth/*`, politique mot de passe forte (12 chars + complexité) | Blocage temporaire de l'IP, analyse logs, notification utilisateur |
| R3 | Injection SQL | 3 | 5 | 15 — Élevé | Prisma ORM (requêtes paramétrées), `ValidationPipe` strict, pas d'interpolation manuelle | Patch d'urgence, audit requêtes Prisma, revue de code |
| R4 | Élévation de privilège (accès admin non autorisé) | 4 | 5 | 20 — Critique | `AuthGuard` + `RolesGuard` globaux, vérification ownership, décorateurs `@Roles()` explicites | Révocation tokens, audit `audit_log`, downgrade rôle utilisateur |
| R5 | Fuite de secrets (`.env` committé par erreur) | 2 | 5 | 10 — Élevé | `.gitignore` strict, `.env.example` sans valeurs réelles, secrets en CI uniquement (GitHub Secrets) | Rotation immédiate de tous secrets exposés (`AUTH_TOKEN_SECRET`, credentials DB) |
| R6 | Dépendance npm vulnérable | 3 | 3 | 9 — Moyen | `npm audit` hebdomadaire, Dependabot activé, mises à jour 48 h | Mise à jour ou remplacement dépendance, re-test complet |
| R7 | Indisponibilité du service (panne serveur / BDD) | 3 | 4 | 12 — Élevé | Healthcheck Docker, `restart: unless-stopped`, sauvegardes `pg_dump` quotidiennes | Rollback via git tag, restauration backup BDD |
| R8 | Perte de données (corruption / suppression accidentelle) | 2 | 5 | 10 — Élevé | Sauvegardes automatiques, volume Docker persistant, tests de restauration mensuels | Restauration du dernier backup sain, investigation cause |
| R9 | Accès non autorisé à la messagerie privée | 3 | 4 | 12 — Élevé | Vérification propriété conversation avant lecture/modification, `RolesGuard` sur endpoints messagerie | Audit logs, notification utilisateurs, blocage compte suspect |
| R10 | Signalement de faux contenu (spam) | 2 | 2 | 4 — Faible | Rate-limiting global, modération humaine via admin panel, historique signalements | Bannissement utilisateur abusif, suppression ressource, notif modérateurs |

> Les risques de criticité ≥ 10 (Élevé et Critique) sont traités en priorité et réévalués lors de la revue de sécurité annuelle (voir `MAINTENANCE.md`).

---

## Conformité RGPD

### Base légale

Le traitement des données repose sur le **consentement** de l'utilisateur (inscription volontaire). L'article **L321-1 du Code des relations entre le public et l'administration (CRPA)** encadre le droit d'accès aux documents. Le projet relève d'une démarche de plateformisation ministérielle — hébergement et responsabilité du traitement relèvent de l'organisme (CESI pour ce projet scolaire ; administration compétente en production réelle).

### Données collectées

| Donnée | Finalité | Sensibilité | Base légale |
|--------|----------|-------------|------------|
| Adresse email | Authentification, communication | Personnelle | Consentement |
| Prénom, nom | Personnalisation, profil public | Personnelle | Consentement |
| Mot de passe (hashé) | Authentification | Personnelle (but de sécurité) | Consentement |
| Photo de profil | Personnalisation, affichage profil | Personnelle | Consentement |
| Messages privés | Messagerie interne | Personnelle | Consentement |
| Commentaires publics | Fonctionnalité discussion | Personnelle (auteur) | Consentement |
| Signalements d'utilisateurs/contenus | Modération | Personnelle | Consentement |
| Progressions (exploitée / mise de côté) | Fonctionnalité suivi | Faible (pas données de santé) | Consentement |
| Historique d'amitié | Gestion réseau social | Faible | Consentement |

### Droits des utilisateurs

| Droit | Endpoint disponible | Responsabilité | Remarque |
|-------|---------------------|---------------|----|
| Accès | `GET /utilisateurs/:id` | Utilisateur accède à ses propres données | Authentifié + ownership |
| Rectification | `PATCH /utilisateurs/:id` (email, prénom, nom, photo) | Utilisateur modifie son profil | Authentifié + ownership |
| Suppression | `DELETE /utilisateurs/:id` | Suppression en cascade (messages, favoris, amis, progressions) | Authentifié + ownership, ou admin |
| Portabilité / export | Non implémenté | À prévoir dans version future (endpoint export JSON) | Demandée mais non codifiée |
| Opposition | Non applicable | Pas de traitement automatisé (profilage, scoring) | Pas de ML/scoring actuellement |

### Sécurité des données

- **Mots de passe** : hachés bcrypt (salt factor 10) — irréversibles, jamais stockés en clair.
- **Tokens JWT** : signés HMAC-SHA256, sans persistance serveur — révocation par rotation `AUTH_TOKEN_SECRET`.
- **Logs applicatifs** : exclusion systématique de tokens, emails (en produit), identifiants personnels.
- **Chiffrement en transit** : HTTPS obligatoire en production (nginx + certbot).
- **Chiffrement au repos** : données PostgreSQL au repos — recommandation : activer pgcrypto pour colonnes sensibles (non implémenté actuellement).

### Durée de conservation

**Non définie actuellement** — action requise :
- Comptes inactifs > 2 ans : suppression ou anonymisation recommandée.
- Messages privés : conservation indéfinie (à réviser légalement).
- Signalements traités : conservation 1 an pour audit, puis suppression.
- Logs applicatifs : rotation quotidienne, archivage 90 jours.

### Transferts hors UE

Aucun transfert hors UE prévu. Infrastructure requise :
- Hébergement **France ou UE** (Scaleway, OVH, AWS EU — recommandé Scaleway pour conformité état français).
- Pas de dépendance cloud tiers sans clause de conformité RGPD.

### Contact DPO

Pour toute demande relative aux données personnelles : **dpo@rr.local** (placeholder — à adapter selon organisation compétente).

Modèle d'exercice de droits :
- Email au DPO avec justificatif d'identité.
- Réponse dans 30 jours (conformité délai légal RGPD article 12).

---

## Procédure de gestion de crise

### Étape 1 — Détection

- Surveillance continue de `GET /health` (uptime robot externe recommandé : **UptimeRobot**).
- Analyse des logs applicatifs (stdout Docker, forwarding vers agrégateur).
- Remontée utilisateur via GitHub Issues (label `bug` + `security` + `priority:critical`).
- Alertes Dependabot sur vulnérabilités npm.
- Alertes Sentry sur erreurs runtime en production.

### Étape 2 — Confinement

```bash
# Si la faille est critique : mise hors ligne immédiate de l'API
docker compose -f docker-compose.prod.yml stop api

# Révoquer tous les tokens actifs (rotation du secret JWT HMAC)
# 1. Générer un nouveau secret fort
openssl rand -base64 64

# 2. Mettre à jour .env.prod
# AUTH_TOKEN_SECRET=<nouveau-secret-fort>

# 3. Redémarrer uniquement l'API
docker compose -f docker-compose.prod.yml up -d api
```

> La rotation du `AUTH_TOKEN_SECRET` invalide immédiatement tous les tokens JWT émis — les utilisateurs devront se reconnecter.

### Étape 3 — Éradication

```bash
# Corriger le code, créer une branche hotfix depuis main
git checkout main
git pull origin main
git checkout -b hotfix/<description-courte>
# ... corrections dans src/ ...
# ... ajouter tests de régression ...
git add .
git commit -m "hotfix(<module>): <description>"
git push origin hotfix/<description-courte>

# Créer une Pull Request sur main (revue accélérée)
gh pr create --base main --title "hotfix(<module>): <description>"
# ou via interface GitHub

# Une fois approuvée et mergée sur main :
# Rebuilder et redéployer l'image
docker compose -f docker-compose.prod.yml up -d --build api

# Appliquer migrations si changements schéma
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy

# Propager le correctif en aval (preprod et develop)
# pour éviter qu'il ne soit écrasé au prochain merge normal
git checkout preprod && git pull && git merge --no-ff origin/main && git push
git checkout develop && git pull && git merge --no-ff origin/preprod && git push
```

### Étape 4 — Notification CNIL

En cas de violation de données personnelles impactant des utilisateurs :

- **Délai légal** : notification à la CNIL dans les **72 heures** suivant la découverte.
- **Portail de notification** : [https://notifications.cnil.fr](https://notifications.cnil.fr)
- **Informations à fournir** :
  - Nature de la violation (injection SQL, fuite de secrets, etc.)
  - Catégories et nombre estimé de personnes concernées
  - Conséquences probables (perte de confidentiel, etc.)
  - Mesures prises ou envisagées (patch, rollback, etc.)
- **Si risque élevé** : notifier également les utilisateurs concernés directement (email, notification in-app).

---

## Checklist de rotation des secrets

### `AUTH_TOKEN_SECRET`

Rotation **mensuelle** minimum (recommandé pour limiter window of exposure).
Rotation **immédiate** en cas de suspicion de compromission.

```bash
# 1. Générer un nouveau secret (≥ 64 caractères base64)
openssl rand -base64 64
# Exemple : VWc3pqL9Ky8mN2jX5zR0fB7tH4vD6wJ1sE3cP9lQ2xM8nY6oI0aK5uG7bF3dC4eL9jH

# 2. Mettre à jour .env.prod
nano .env.prod
#    AUTH_TOKEN_SECRET=<nouvelle-valeur>

# 3. Redémarrer l'API (invalide tous les tokens existants)
docker compose -f docker-compose.prod.yml restart api

# 4. Notifier les utilisateurs (reconnexion requise)
# Email automatique ou in-app notification recommandée
```

### Credentials de la base de données

Rotation **trimestrielle** (ou en cas de départ d'un membre ayant accès).

```bash
# 1. Générer un nouveau mot de passe fort
openssl rand -base64 32

# 2. Via psql directement (sans perte données)
docker compose -f docker-compose.prod.yml exec db \
  psql -U $POSTGRES_USER -c "ALTER USER $POSTGRES_USER PASSWORD '<nouveau-mdp>';"

# 3. Mettre à jour POSTGRES_PASSWORD dans .env.prod (DATABASE_URL est
#    construite automatiquement à partir des POSTGRES_* au démarrage du compose)
nano .env.prod

# 4. Redémarrer l'API
docker compose -f docker-compose.prod.yml restart api

# 5. Vérifier la connexion
docker compose -f docker-compose.prod.yml exec api npx prisma db execute --stdin <<EOF
SELECT version();
EOF
```

### Tokens CI/CD GitHub Actions

Rotation **semestrielle** (recommandé).
Rotation **immédiate** si exposition publique ou départ équipe.

- **GitHub Secrets** (utilisés en `.github/workflows/ci.yml`) :
  - Renouveler via l'interface Settings → Secrets and variables → Actions.
- **SSH keys** pour déploiement (si utilisés) : rotation semestrielle.
- **Docker Hub / GitHub Container Registry tokens** : rotation semestrielle.

---

## Récapitulatif des intervalles de rotation

| Secret | Rotation régulière | Rotation d'urgence |
|--------|-------------------|--------------------|
| `AUTH_TOKEN_SECRET` | Mensuel | Immédiate si compromis |
| `POSTGRES_PASSWORD` | Trimestriel | Immédiate si compromis |
| Tokens CI/CD GitHub | Semestriel | Immédiate si leak public |
| SSH keys déploiement | Semestriel | Immédiate si leak |

---

## Ressources externes

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [CNIL — Conformité RGPD](https://www.cnil.fr/fr/rgpd)
- [Notifications violations CNIL](https://notifications.cnil.fr)
- [NestJS Security](https://docs.nestjs.com/security)
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient#security)
