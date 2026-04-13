# Rapport de Non-Regression — Backend Ressources Relationnelles

**Projet** : Ressources Relationnelles
**Module** : Backend NestJS

---

## Modele de rapport (a remplir apres chaque execution CI)

**Date d'execution** : 2026-04-13
**Branche** : feat/add-tests
**Commit** : 421b5bb
**Executee par** : Fred

---

## Resultats des tests unitaires

| Metrique | Valeur |
|---|---|
| Tests executes | 143 |
| Tests passes | 143 |
| Tests echoues | 0 |
| Tests ignores | 0 |
| Duree | ~8s |

### Couverture de code

| Scope | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| Services (`src/**/*.service.ts`) | > 70% | > 70% | > 70% | > 70% |
| Gardes (`auth.guard`, `roles.guard`) | > 90% | > 90% | > 90% | > 90% |
| Global | > 70% | > 70% | > 70% | > 70% |

---

## Resultats des tests E2E

| Metrique | Valeur |
|---|---|
| Suites executees | 9 |
| Tests executes | 59 |
| Tests passes | 59 |
| Tests echoues | 0 |
| Duree | ~12s |

### Detail par suite

| Suite | Passes | Echoues | Statut |
|---|---|---|---|
| auth.e2e-spec | 12 | 0 | OK |
| utilisateurs.e2e-spec | 11 | 0 | OK |
| ressources.e2e-spec | 11 | 0 | OK |
| categories.e2e-spec | 8 | 0 | OK |
| messagerie.e2e-spec | 3 | 0 | OK |
| amis.e2e-spec | 3 | 0 | OK |
| signalements.e2e-spec | 5 | 0 | OK |
| upload.e2e-spec | 3 | 0 | OK |
| app.e2e-spec | 1 | 0 | OK |

---

## Regressions detectees

Aucune regression detectee.

---

## Conclusion

- [x] **Aucune regression** — tous les tests passent.

---

## Historique des executions

| Date | Branche | Commit | Unit | E2E | Couverture | Statut |
|---|---|---|---|---|---|---|
| 2026-04-13 | feat/add-tests | 421b5bb | 143/143 | 59/59 | > 70% | OK |

---

## Comment regenerer ce rapport

```bash
# Lancer les tests unitaires avec couverture
cd backend
npm run test:cov

# Lancer les tests e2e (requiert Docker)
npm run test:db:up
npm run test:e2e:setup
npm run test:e2e

# Tout en un (CI)
npm run test:ci
```

Les rapports JSON de Jest sont disponibles dans :
- `coverage/coverage-summary.json` (unitaires)
- Sortie standard Jest (e2e)

Pour automatiser la mise a jour de ce rapport, la sortie de `npm run test:ci` dans les GitHub Actions est archivee dans les artefacts du workflow `backend-tests.yml`.
