<!-- Merci pour ta contribution. Remplis chaque section avant de demander une review. -->

## Contexte

<!-- Pourquoi ce changement ? Quel problème il résout ou quelle fonctionnalité il apporte ? -->

## Changements apportés

<!-- Liste claire des modifications principales (1 puce par changement notable). -->

-
-

## Type de changement

- [ ] `fix` — correction d'une anomalie
- [ ] `feat` — nouvelle fonctionnalité
- [ ] `refactor` — refactorisation sans changement de comportement
- [ ] `perf` — amélioration de performance
- [ ] `docs` — documentation uniquement
- [ ] `chore` / `ci` — tooling, CI, dépendances
- [ ] `BREAKING CHANGE` — casse une API ou nécessite une migration

## Checklist

- [ ] Les tests unitaires passent (`npm run test`)
- [ ] Les tests e2e passent (`npm run test:e2e`)
- [ ] Le lint passe (`npm run lint`)
- [ ] Le build passe (`npm run build`)
- [ ] Les migrations Prisma sont incluses si le schéma a changé (`prisma migrate dev --name <desc>`)
- [ ] Les nouveaux endpoints ont un guard et un rôle approprié (`@UseGuards`, `@Roles`)
- [ ] Les DTO sont validés via `class-validator` (`whitelist: true`)
- [ ] La documentation est à jour si nécessaire (README, `docs/`, Swagger `@ApiTags`/`@ApiOperation`)
- [ ] Pas de secret ni de credential commité (`.env` ignoré)

## Tickets liés

<!-- Closes #123, Refs #456 -->

## Notes pour le reviewer

<!-- Points d'attention particuliers, choix de conception à discuter, capture Postman si pertinent. -->
