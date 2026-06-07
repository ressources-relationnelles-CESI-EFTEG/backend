# Plan de maintenance — Ressources Relationnelles Backend

## Outillage de gestion des évolutions

Le suivi opérationnel s'appuie sur **deux outils complémentaires** :

- **GitHub Issues** — catalogue technique des fonctionnalités, anomalies et tâches techniques. Chaque issue est liée nativement aux commits, branches et pull requests (closing keywords, mentions, références croisées) : la traçabilité code ↔ ticket est automatique. Les templates structurés (`.github/ISSUE_TEMPLATE/bug_report.md`, `feature_request.md`, `config.yml`) garantissent que chaque demande contient les informations nécessaires à son traitement. Les **GitHub Milestones** sont utilisées pour le suivi par release (ex. `v1.0.0`, `v1.1.0`).
- **Trello** — pilotage opérationnel quotidien : visualisation kanban, priorisation visuelle, planification de sprint, répartition des assignations dans l'équipe. Les cartes Trello en cours référencent les issues GitHub correspondantes.

Cette articulation découpe les responsabilités : GitHub Issues = **source de vérité technique** (lié au code), Trello = **vue de pilotage** (lié à l'équipe).

## GitHub Issues — catalogue technique

### Labels recommandés

| Label | Couleur | Usage |
|-------|---------|-------|
| `bug` | Rouge (`#d73a4a`) | Anomalie ou comportement inattendu |
| `feature` | Bleu (`#0075ca`) | Nouvelle fonctionnalité demandée |
| `security` | Orange (`#e4a42b`) | Problème ou amélioration de sécurité |
| `documentation` | Vert (`#0e8a16`) | Mise à jour de la documentation |
| `priority:critical` | Rouge foncé (`#b60205`) | Bloquant — traitement immédiat |
| `priority:high` | Orange (`#d93f0b`) | Majeur — traitement prioritaire |
| `priority:medium` | Jaune (`#fbca04`) | Normal — planifié en sprint |
| `priority:low` | Gris (`#cfd3d7`) | Mineur ou cosmétique |
| `module:auth` | Violet (`#6f42c1`) | Module authentification |
| `module:utilisateurs` | Bleu clair (`#0099cc`) | Module utilisateurs |
| `module:ressources` | Cyan (`#1f883d`) | Module ressources |
| `module:messagerie` | Rose (`#d4af37`) | Module messagerie |
| `module:amis` | Magenta (`#9d3dcf`) | Module amis |
| `module:signalements` | Orange foncé (`#cc3300`) | Module signalements |

### Templates d'issues

**Bug report** (`.github/ISSUE_TEMPLATE/bug_report.md`) doit inclure :
- Étapes de reproduction (numérotées)
- Comportement attendu vs comportement observé
- Logs d'erreur (masquer mots de passe, tokens, données perso)
- Environnement (version Node, OS, rôle utilisateur si applicable)
- Lien vers commit ou PR si connu

**Feature request** (`.github/ISSUE_TEMPLATE/feature_request.md`) doit inclure :
- Besoin métier ou utilisateur (contexte)
- Description de la fonctionnalité souhaitée
- Critères d'acceptance (liste vérifiable)
- Maquettes ou exemples si disponibles
- Module(s) impactés

**Security report** — contacter DPO plutôt qu'issue publique.

### Milestones et tri

- Chaque issue est associée à une **Milestone GitHub** (ex. `v0.2.0`, `v0.3.0`) pour suivre l'avancement par release et fixer des échéances.
- Les labels `priority:*` et `module:*` facilitent le tri et l'assignation dans la vue liste d'issues comme dans le filtre Trello.

## Trello — pilotage opérationnel

Le tableau Kanban opérationnel est hébergé sur **Trello**. Chaque carte Trello référence l'issue GitHub correspondante (URL en commentaire ou description) pour garder le lien code ↔ ticket et permettre les retours croisés (commit fermant l'issue ↔ carte avançant de colonne).

Structure de colonnes :

```
┌──────────┬──────────────┬───────────┬──────┐
│ Backlog  │ In Progress  │ In Review │ Done │
├──────────┼──────────────┼───────────┼──────┤
│ Issues   │ Branches     │ PRs       │ PRs  │
│ triées   │ en cours     │ ouvertes  │ mergées
└──────────┴──────────────┴───────────┴──────┘
```

L'équipe consulte Trello pour le suivi quotidien (stand-up, priorisation, drag-and-drop visuel) et GitHub Issues pour la rigueur technique (formulaires structurés, recherche full-text, intégration au code).

---

## SLA (Service Level Agreement)

| Priorité | Définition | Délai prise en charge | Délai résolution |
|----------|-----------|:---------------------:|:----------------:|
| Bloquant critique | Application inaccessible ou perte de données | 1 heure | 4 heures |
| Majeur | Fonctionnalité principale dégradée ou inutilisable | 4 heures | 1 jour ouvré |
| Mineur | Anomalie cosmétique ou comportement dégradé non bloquant | 1 jour ouvré | 40 heures ouvrées |
| Amélioration | Feature request ou optimisation | Best effort | Planifié en milestone |

> Ces délais s'appliquent aux heures ouvrées (9h–18h, du lundi au vendredi) sauf mention contraire.

---

## Procédure de gestion d'incident

### 1 — Détection

- Surveillance de `GET /health` (retourne `{ status: "ok" }` si opérationnel).
- Analyse des logs applicatifs (stdout Docker) ou agrégateur (Loki/Grafana).
- Remontée utilisateur : créer issue GitHub avec labels `bug` + `priority:critical`.
- Alertes automatiques : Dependabot (npm), GitHub Actions (CI échouée), Sentry (erreurs runtime).

### 2 — Escalade

- @mentionner le mainteneur principal dans l'issue GitHub.
- Si délai SLA risque d'être dépassé : notification email.
- Pour incidents critiques : activer procédure de gestion de crise (voir `SECURITY.md`).
- Notifier l'équipe frontend / mobile si dépendance API.

### 3 — Correction

Un hotfix vise la mise en production rapide d'un correctif critique. Il **court-circuite le flux normal** (`develop → preprod → main`) en branchant directement depuis `main`, puis se propage en aval pour garder les branches synchronisées.

```bash
# 1. Créer une branche hotfix depuis main
git checkout main
git pull origin main
git checkout -b hotfix/<description-courte>

# 2. Développer le correctif dans src/
# ... modifications ...

# 3. Écrire ou adapter les tests (unitaires + E2E si modifie endpoint)
npm run test
npm run test:cov
npm run test:e2e

# 4. Pousser et ouvrir une Pull Request vers main
git push origin hotfix/<description-courte>
gh pr create --base main --title "hotfix(<module>): <description>"
```

La PR vers `main` doit :
- Passer tous les checks CI (lint + tests unitaires + E2E + build).
- Être approuvée par au moins un autre membre si possible.
- Être mergée en **squash merge** ou **rebase merge** pour historique lisible.

```bash
# 5. Une fois mergé sur main, propager en aval pour synchroniser
#    preprod et develop avec le correctif :
git checkout preprod
git pull origin preprod
git merge --no-ff origin/main -m "chore: back-merge hotfix from main"
git push origin preprod

git checkout develop
git pull origin develop
git merge --no-ff origin/preprod -m "chore: sync develop with preprod"
git push origin develop
```

Cette propagation évite que le hotfix ne soit « écrasé » au prochain merge `develop → preprod → main`.

### 4 — Post-mortem

Rédiger un résumé directement dans l'issue GitHub (ou dans issue dédiée) contenant :
- **Cause racine** : qu'est-ce qui a provoqué l'incident ?
- **Impact** : durée, nombre utilisateurs affectés, fonctionnalités indisponibles.
- **Chronologie** : détection → confinement → résolution (avec timestamps).
- **Actions correctives** : ce qui a été fait.
- **Mesures préventives** : ce qui sera fait pour éviter récurrence (test ajouté ? refactor ? alerte ?).

---

## Calendrier de maintenance

### Hebdomadaire

- [ ] Exécuter `npm audit` et traiter vulnérabilités **critiques ou hautes** :
  ```bash
  npm audit
  npm audit fix
  npm audit fix --audit-level=moderate  # si nécessaire
  ```
- [ ] Vérifier alertes **Dependabot** dans GitHub (Settings → Code security).
- [ ] Contrôler les logs d'erreur applicatifs (stdout, Sentry si activé).
- [ ] Vérifier que les jobs CI passent sur `main` et `develop`.

### Mensuel

- [ ] Tester la procédure de restauration de backup sur environnement de test :
  ```bash
  # Créer une sauvegarde fraîche
  docker compose -f docker-compose.prod.yml exec db \
    pg_dump -U $POSTGRES_USER $POSTGRES_DB > /tmp/test-backup.sql
  
  # Restaurer sur DB de test
  docker compose -f docker-compose.test.yml exec -T db \
    psql -U $POSTGRES_USER test_db < /tmp/test-backup.sql
  ```
- [ ] Relire issues ouvertes et mettre à jour priorités.
- [ ] Vérifier espace disque sur serveur prod (logs, backups) :
  ```bash
  docker exec <db-container> df -h /var/lib/postgresql/data
  ```
- [ ] Contrôler expiration certificat TLS (alerte à J-30 si HTTPS activé).

### Trimestriel

- [ ] Mettre à jour dépendances **majeures** (NestJS, Prisma, Node.js LTS) :
  ```bash
  npx npm-check-updates -i   # mise à jour interactive
  npm install
  npm run test && npm run test:cov && npm run test:e2e
  
  # Si changements Prisma majeurs
  npx prisma migrate dev --name <description>
  ```
- [ ] Revoir permissions et accès (comptes service, tokens CI/CD, secrets GitHub).
- [ ] Vérifier que les migrations Prisma sont bien versionnées.
- [ ] Audit dépendances : identifier et planifier obsolescence.
- [ ] Tester plan de reprise d'activité (PRA) : simuler panne, vérifier rollback via git tag.

### Annuel

- [ ] Revue de sécurité **OWASP complète** (réévaluer matrice dans `SECURITY.md`) :
  ```bash
  npm audit --omit=dev
  npm run test:cov  # vérifier seuil couverture
  # Audit manuel : vérifier AuthGuard, RolesGuard, CORS, Helmet config
  ```
- [ ] Rotation des credentials de la base de données (voir `SECURITY.md`).
- [ ] Rotation des **tokens CI/CD** et clés SSH.
- [ ] Audit des comptes utilisateurs (supprimer comptes inactifs > 2 ans si politique définie).
- [ ] Revoir politique de **conservation des données** (RGPD) — implémenter si absent.
- [ ] Vérifier hébergement conforme région (France/UE), pas de dérive cloud.

---

## Tableau de bord et monitoring

### Suivi de projet

- **GitHub Milestones** : vue d'avancement par release (% issues fermées).
- **GitHub Insights** : activité commits, PR velocity, taux approbation.
- **GitHub Actions** : historique builds CI, taux succès.

### Monitoring applicatif

| Outil | Usage | Coût | Statut |
|-------|-------|------|--------|
| `GET /health` | Vérification basique disponibilité (public, sans auth) | Gratuit (intégré) | Implémenté |
| **UptimeRobot** | Ping `/health` toutes les 5 minutes, alertes email/SMS | Gratuit (plan gratuit) | Recommandé, non activé |
| **Loki + Grafana** | Agrégation et visualisation logs applicatifs | Open source (auto-hébergé) | Optionnel |
| **Sentry** | Capture et agrégation erreurs runtime (exceptions) | Freemium (~€20/mois pour plan pro) | Recommandé, non activé |
| **Prometheus** | Métriques système (CPU, RAM, connexions DB) | Open source | Optionnel |

### Configuration UptimeRobot (recommandée)

1. Créer compte sur [uptimerobot.com](https://uptimerobot.com).
2. Ajouter moniteur type **HTTP(s)**.
3. URL : `https://api.rr.gouv.fr/health` (ou adresse prod).
4. Intervalle : **5 minutes**.
5. Alertes : email + webhook Slack/Discord si souhaité.

### Endpoint `/health`

```
GET /health
→ 200 OK
{
  "status": "ok"
}
```

Cet endpoint est **public** (hors authentification) et doit rester accessible en permanence pour monitoring externe.

### Configuration Sentry (optionnel, recommandé pour prod)

1. Créer compte sur [sentry.io](https://sentry.io).
2. Créer projet NestJS.
3. Installer dépendance :
   ```bash
   npm install @sentry/nestjs @sentry/tracing
   ```
4. Intégrer dans `main.ts` :
   ```typescript
   import * as Sentry from '@sentry/nestjs';
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
     tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
   });
   ```
5. Ajouter `SENTRY_DSN` dans `.env.production`.

### Logs via stdout (NestJS natif)

NestJS envoie les logs sur **stdout** par défaut :
```bash
# Afficher les logs en temps réel
docker compose -f docker-compose.prod.yml logs -f api

# Afficher les logs des N dernières lignes
docker compose -f docker-compose.prod.yml logs api --tail 100
```

Recommandation : configurer un **log shipper** (logstash, filebeat, ou fluent-bit) pour envoyer les logs vers :
- Elasticsearch + Kibana
- Loki + Grafana
- Datadog
- CloudWatch (si AWS)

---

## Checklist de déploiement en production

Avant tout déploiement en production :

- [ ] Tous les tests passent (`npm run test:ci`).
- [ ] Code review approuvée (au moins 1 autre développeur).
- [ ] PR mergée sur `main`.
- [ ] Changelog mis à jour (`docs/CHANGELOG.md`).
- [ ] Git tag créé avec version sémantique (`git tag v0.2.0`).
- [ ] Image Docker construite et testée localement.
- [ ] `.env.production` préparé avec secrets forts.
- [ ] Sauvegarde BDD actuelle effectuée.
- [ ] Procédure rollback testée (avoir tag précédent accessible).
- [ ] Team notifiée du déploiement (heure, durée estimée, plan rollback).

```bash
# Checklist exécutable
git tag v0.2.0
docker compose -f docker-compose.prod.yml up -d --build api
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy
docker compose -f docker-compose.prod.yml exec api npm run health
```

---

## Ressources

- Repo GitHub : [ressources-relationnelles-CESI-EFTEG/backend](https://github.com/ressources-relationnelles-CESI-EFTEG/backend)
- NestJS docs : [nestjs.com](https://docs.nestjs.com)
- Prisma docs : [prisma.io](https://www.prisma.io/docs)
- GitHub Issues : [templates](.github/ISSUE_TEMPLATE/)
