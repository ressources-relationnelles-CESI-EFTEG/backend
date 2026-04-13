# Cahier de Tests — Backend Ressources Relationnelles

**Projet** : Ressources Relationnelles (CDA — Cas H2O V2)
**Module** : Backend NestJS
**Version** : 1.0
**Date** : 2026-04-13

---

## Legende

| Colonne | Description |
|---|---|
| ID | Identifiant unique du cas (MODULE-TYPE-NUMERO) |
| Type | U = Unitaire, E = E2E/Integration |
| Priorite | P1 Critique, P2 Majeur, P3 Mineur |
| Statut | Passe / Echoue / Non execute |

---

## 1. Authentification

### 1.1 AuthService (unitaire)

| ID | Description | Preconditions | Etapes | Attendu | Priorite | Statut |
|---|---|---|---|---|---|---|
| AUTH-U-01 | Login valide | User ACTIF en base (mock) | `login({ email, password })` | Retourne `{ accessToken }` | P1 | |
| AUTH-U-02 | Login mauvais mot de passe | User en base, bcrypt.compare = false | `login(...)` | Leve `UnauthorizedException` | P1 | |
| AUTH-U-03 | Login utilisateur inconnu | `findUnique` retourne null | `login(...)` | Leve `UnauthorizedException` | P1 | |
| AUTH-U-04 | Login user INACTIF | User statut INACTIF | `login(...)` | Leve `UnauthorizedException` | P1 | |
| AUTH-U-05 | Login user SUSPENDU | User statut SUSPENDU | `login(...)` | Leve `UnauthorizedException` | P1 | |
| AUTH-U-06 | Register valide | `create` retourne le user | `register({ email, password, confirmPassword, ... })` | Retourne user sans motDePasse | P1 | |
| AUTH-U-07 | Register mots de passe non identiques | — | `register({ password: 'a', confirmPassword: 'b', ... })` | Leve `BadRequestException` | P1 | |
| AUTH-U-08 | Register mot de passe < 8 caracteres | — | `register({ password: '1234567', ... })` | Leve `BadRequestException` | P2 | |
| AUTH-U-09 | Register email deja pris | `create` leve P2002 | `register(...)` | Leve `ConflictException` | P1 | |
| AUTH-U-10 | createAdmin valide | `create` retourne le user | `createAdmin({ email, password, ... })` | Retourne user ADMINISTRATEUR | P1 | |
| AUTH-U-11 | createAdmin email deja pris | `create` leve P2002 | `createAdmin(...)` | Leve `ConflictException` | P2 | |
| AUTH-U-12 | verifyToken valide | Token signe avec le bon secret | `verifyToken(token)` | Retourne `{ userId, email }` | P1 | |
| AUTH-U-13 | verifyToken signature invalide | Token altere | `verifyToken(token)` | Retourne null | P1 | |
| AUTH-U-14 | verifyToken expire (> 24h) | Timestamp vieux de 25h | `verifyToken(token)` | Retourne null | P1 | |
| AUTH-U-15 | verifyToken format invalide | Token sans point | `verifyToken(token)` | Retourne null | P2 | |

### 1.2 AuthGuard (unitaire)

| ID | Description | Preconditions | Etapes | Attendu | Priorite | Statut |
|---|---|---|---|---|---|---|
| GUARD-U-01 | Route @Public() | Reflector retourne IS_PUBLIC_KEY = true | `canActivate(ctx)` | Retourne true sans verifier le token | P1 | |
| GUARD-U-02 | Header Authorization absent | Header vide | `canActivate(ctx)` | Leve `UnauthorizedException` | P1 | |
| GUARD-U-03 | Prefixe non "Bearer" | Header "Basic xxx" | `canActivate(ctx)` | Leve `UnauthorizedException` | P1 | |
| GUARD-U-04 | Token invalide | `verifyToken` retourne null | `canActivate(ctx)` | Leve `UnauthorizedException` | P1 | |
| GUARD-U-05 | Token valide | `verifyToken` retourne payload | `canActivate(ctx)` | `request.user` injecte, retourne true | P1 | |

### 1.3 RolesGuard (unitaire)

| ID | Description | Preconditions | Etapes | Attendu | Priorite | Statut |
|---|---|---|---|---|---|---|
| ROLES-U-01 | Aucun decorateur @Roles | Reflector retourne undefined | `canActivate(ctx)` | Retourne true | P1 | |
| ROLES-U-02 | @Roles([]) vide | Reflector retourne [] | `canActivate(ctx)` | Retourne true | P2 | |
| ROLES-U-03 | Pas de user sur request | request.user = undefined | `canActivate(ctx)` | Leve `UnauthorizedException` | P1 | |
| ROLES-U-04 | User introuvable en base | `findUnique` retourne null | `canActivate(ctx)` | Leve `ForbiddenException` | P1 | |
| ROLES-U-05 | Role insuffisant | User CITOYEN, route MODERATEUR | `canActivate(ctx)` | Leve `ForbiddenException` | P1 | |
| ROLES-U-06 | Role suffisant | User MODERATEUR, route MODERATEUR | `canActivate(ctx)` | Retourne true | P1 | |
| ROLES-U-07 | SUPER_ADMIN | User SUPER_ADMIN, route ADMINISTRATEUR | `canActivate(ctx)` | Retourne true | P1 | |

### 1.4 Auth E2E

| ID | Description | Preconditions | Etapes | Attendu | Priorite | Statut |
|---|---|---|---|---|---|---|
| AUTH-E2E-01 | POST /auth/register — succes | DB vide | Body valide | 201, user retourne sans motDePasse | P1 | |
| AUTH-E2E-02 | POST /auth/register — doublon email | User existant | Meme email | 409 | P1 | |
| AUTH-E2E-03 | POST /auth/register — mots de passe non identiques | — | `password != confirmPassword` | 400 | P1 | |
| AUTH-E2E-04 | POST /auth/login — succes | User ACTIF en base | Credentials valides | 200, `accessToken` present | P1 | |
| AUTH-E2E-05 | POST /auth/login — mauvais mot de passe | User en base | Mauvais mot de passe | 401 | P1 | |
| AUTH-E2E-06 | GET route protegee sans token | — | Pas de header Authorization | 401 | P1 | |
| AUTH-E2E-07 | GET route protegee avec token valide | User en base | Token valide | 200 | P1 | |
| AUTH-E2E-08 | POST /auth/admin — super_admin cree admin | Super_admin authentifie | Body valide | 201 | P1 | |
| AUTH-E2E-09 | POST /auth/admin — citoyen refuse | Citoyen authentifie | Body valide | 403 | P1 | |

---

## 2. Utilisateurs

### 2.1 UtilisateursService (unitaire)

| ID | Description | Preconditions | Etapes | Attendu | Priorite | Statut |
|---|---|---|---|---|---|---|
| USR-U-01 | findAll | `findMany` mock | `findAll({})` | Liste sans motDePasse | P2 | |
| USR-U-02 | findAll avec filtre recherche | `findMany` mock | `findAll({ search: 'alice' })` | Clause where avec `contains` | P2 | |
| USR-U-03 | findById — trouve | `findUnique` retourne user | `findById(1)` | User sans motDePasse | P1 | |
| USR-U-04 | findById — non trouve | `findUnique` retourne null | `findById(99)` | Leve `NotFoundException` | P1 | |
| USR-U-05 | update | `update` mock | `update(1, dto)` | User mis a jour | P2 | |
| USR-U-06 | updateStatut | `update` mock | `updateStatut(1, { statut: 'INACTIF' })` | Statut mis a jour | P2 | |
| USR-U-07 | updateRole | `update` mock | `updateRole(1, { role: 'MODERATEUR' })` | Role mis a jour | P2 | |
| USR-U-08 | remove | `delete` mock | `remove(1)` | `delete` appele avec `{ idUtilisateur: 1 }` | P2 | |

### 2.2 Utilisateurs E2E

| ID | Description | Preconditions | Etapes | Attendu | Priorite | Statut |
|---|---|---|---|---|---|---|
| USR-E2E-01 | GET /utilisateurs — admin | Admin authentifie | GET /utilisateurs | 200, liste | P1 | |
| USR-E2E-02 | GET /utilisateurs — citoyen | Citoyen authentifie | GET /utilisateurs | 403 | P1 | |
| USR-E2E-03 | GET /utilisateurs/:id | User en base | GET /utilisateurs/:id | 200, sans motDePasse | P1 | |
| USR-E2E-04 | GET /utilisateurs/:id — inexistant | — | GET /utilisateurs/99999 | 404 | P2 | |
| USR-E2E-05 | PATCH /utilisateurs/:id | User owner | PATCH avec { nom: 'Nouveau' } | 200 | P1 | |
| USR-E2E-06 | PATCH /utilisateurs/:id/statut — admin | Admin | PATCH { statut: 'INACTIF' } | 200 | P1 | |
| USR-E2E-07 | PATCH /utilisateurs/:id/statut — citoyen | Citoyen | PATCH { statut: 'INACTIF' } | 403 | P1 | |
| USR-E2E-08 | PATCH /utilisateurs/:id/role | Admin | PATCH { role: 'MODERATEUR' } | 200 | P1 | |
| USR-E2E-09 | DELETE /utilisateurs/:id — admin | Admin | DELETE | 200 | P1 | |
| USR-E2E-10 | DELETE /utilisateurs/:id — citoyen | Citoyen | DELETE autre user | 403 | P1 | |

---

## 3. Ressources

### 3.1 RessourcesService (unitaire)

| ID | Description | Etapes | Attendu | Priorite | Statut |
|---|---|---|---|---|---|
| RES-U-01 | findAll filtre VALIDEE + PUBLIQUE | `findAll({})` | Clause `where: { statut: 'VALIDEE', visibilite: 'PUBLIQUE' }` | P1 | |
| RES-U-02 | findAll avec categorie | `findAll({ categorieId: 1 })` | Clause `idCategorie: 1` dans where | P2 | |
| RES-U-03 | findById OK | `findById(1)` | Ressource retournee | P1 | |
| RES-U-04 | findById NotFound | `findById(99)` | `NotFoundException` | P1 | |
| RES-U-05 | findByUtilisateur | `findByUtilisateur(1)` | Liste ressources du user | P2 | |
| RES-U-06 | create | `create(dto)` | `prisma.ressource.create` appele | P1 | |
| RES-U-07 | update — set dateModification | `update(1, dto)` | `dateModification: new Date()` dans data | P2 | |
| RES-U-08 | remove | `remove(1)` | `prisma.ressource.delete` appele | P2 | |

### 3.2 Ressources E2E

| ID | Description | Etapes | Attendu | Priorite | Statut |
|---|---|---|---|---|---|
| RES-E2E-01 | GET /ressources | GET /ressources | 200, uniquement VALIDEE+PUBLIQUE | P1 | |
| RES-E2E-02 | GET /ressources?categorieId=X | GET avec query | 200, filtrees par categorie | P2 | |
| RES-E2E-03 | GET /ressources/:id | GET ressource existante | 200 | P1 | |
| RES-E2E-04 | GET /ressources/:id inexistant | GET id 99999 | 404 | P2 | |
| RES-E2E-05 | GET /ressources/utilisateur/:id | GET ses ressources | 200, toutes statuts | P1 | |
| RES-E2E-06 | POST /ressources | POST authentifie | 201 | P1 | |
| RES-E2E-07 | POST /ressources sans token | POST sans auth | 401 | P1 | |
| RES-E2E-08 | PATCH /ressources/:id — moderateur | PATCH moderateur | 200 | P1 | |
| RES-E2E-09 | PATCH /ressources/:id — citoyen | PATCH citoyen | 403 | P1 | |
| RES-E2E-10 | DELETE /ressources/:id — moderateur | DELETE moderateur | 200 | P1 | |

---

## 4. Categories

| ID | Type | Description | Etapes | Attendu | Priorite | Statut |
|---|---|---|---|---|---|---|
| CAT-U-01 | U | findAll avec enfants | `findAll()` | `include: { enfants: true }` | P2 | |
| CAT-U-02 | U | findById OK | `findById(1)` | Categorie retournee | P1 | |
| CAT-U-03 | U | findById NotFound | `findById(99)` | `NotFoundException` | P1 | |
| CAT-U-04 | U | create | `create({ nom: 'Sport' })` | Categorie creee | P1 | |
| CAT-U-05 | U | update | `update(1, { nom: 'Nouveau' })` | Categorie mise a jour | P2 | |
| CAT-U-06 | U | remove | `remove(1)` | `delete` appele | P2 | |
| CAT-E2E-01 | E | GET /categories | GET | 200 | P1 | |
| CAT-E2E-02 | E | GET /categories/:id | GET existante | 200 | P1 | |
| CAT-E2E-03 | E | GET /categories/:id inexistante | GET 99999 | 404 | P2 | |
| CAT-E2E-04 | E | POST — admin | POST admin | 201 | P1 | |
| CAT-E2E-05 | E | POST — citoyen | POST citoyen | 403 | P1 | |
| CAT-E2E-06 | E | PATCH — admin | PATCH admin | 200 | P1 | |
| CAT-E2E-07 | E | DELETE — admin | DELETE admin | 200 | P1 | |
| CAT-E2E-08 | E | DELETE — citoyen | DELETE citoyen | 403 | P1 | |

---

## 5. Messagerie

| ID | Type | Description | Etapes | Attendu | Priorite | Statut |
|---|---|---|---|---|---|---|
| MSG-U-01 | U | findConversationsByUtilisateur | `findConversationsByUtilisateur(1)` | dernierMessage defini, messages absent | P2 | |
| MSG-U-02 | U | findConversationById | `findConversationById(1)` | Conversation avec participants et messages | P1 | |
| MSG-U-03 | U | findConversationById NotFound | `findConversationById(99)` | `NotFoundException` | P1 | |
| MSG-U-04 | U | findMessages | `findMessages(1)` | Messages ordonnes ASC par dateEnvoi | P2 | |
| MSG-U-05 | U | createConversation | `createConversation({ participantIds: [1, 2] })` | participants.create appele | P1 | |
| MSG-U-06 | U | sendMessage | `sendMessage(1, { idUtilisateur: 1, contenu: '...' })` | Message cree | P1 | |
| MSG-U-07 | U | markAsRead | `markAsRead(1, 2)` | `updateMany` avec `idUtilisateur: { not: 2 }` | P2 | |
| MSG-U-08 | U | countUnread | `countUnread(1)` | Retourne `{ nonLus: n }` | P2 | |
| MSG-E2E-01 | E | Flux complet: conv + msg + lu + non-lus | Voir parcours complet | 201/201/200/1 non-lu/200/0 non-lu | P1 | |
| MSG-E2E-02 | E | GET conversations utilisateur | GET /conversations/utilisateur/:id | 200 | P1 | |
| MSG-E2E-03 | E | GET conversation inexistante | GET /conversations/99999 | 404 | P2 | |

---

## 6. Amis

| ID | Type | Description | Etapes | Attendu | Priorite | Statut |
|---|---|---|---|---|---|---|
| AMI-U-01 | U | findByUtilisateur | `findByUtilisateur(1)` | Retourne ami de l'autre cote | P2 | |
| AMI-U-02 | U | findDemandesRecues | `findDemandesRecues(2)` | `idUtilisateur2: 2, statut: EN_ATTENTE` | P2 | |
| AMI-U-03 | U | findDemandesEnvoyees | `findDemandesEnvoyees(1)` | `idUtilisateur1: 1, statut: EN_ATTENTE` | P2 | |
| AMI-U-04 | U | envoyer | `envoyer(1, 2)` | Demande creee statut EN_ATTENTE | P1 | |
| AMI-U-05 | U | envoyer doublon | `create` leve P2002 | `envoyer(1, 2)` | `ConflictException` | P1 | |
| AMI-U-06 | U | accepter | `accepter(1, 2)` | Statut ACCEPTE | P1 | |
| AMI-U-07 | U | accepter non trouve | `findFirst` retourne null | `accepter(1, 2)` | `NotFoundException` | P1 | |
| AMI-U-08 | U | refuser | `refuser(1, 2)` | Statut REFUSE | P1 | |
| AMI-U-09 | U | supprimer | `supprimer(1, 2)` | `delete` appele | P2 | |
| AMI-E2E-01 | E | Flux complet: envoi + acceptation + suppression | Voir parcours complet | 201/200/200/0 | P1 | |
| AMI-E2E-02 | E | Refus demande | Envoi + refus | 200, statut refuse | P1 | |
| AMI-E2E-03 | E | Double demande | Envoi x2 | 409 | P1 | |

---

## 7. Signalements

| ID | Type | Description | Etapes | Attendu | Priorite | Statut |
|---|---|---|---|---|---|---|
| SIG-U-01 | U | findAll sans filtre | `findAll({})` | Tous les signalements | P2 | |
| SIG-U-02 | U | findAll avec filtre statut | `findAll({ statut: 'EN_ATTENTE' })` | Clause `where: { statut }` | P2 | |
| SIG-U-03 | U | create | `create(dto)` | Signalement cree | P1 | |
| SIG-U-04 | U | update — TRAITE | `update(1, { statut: 'TRAITE', ... })` | dateTraitement set | P1 | |
| SIG-U-05 | U | update — EN_ATTENTE | `update(1, { statut: 'EN_ATTENTE' })` | dateTraitement absent | P2 | |
| SIG-E2E-01 | E | POST /signalements — citoyen | POST citoyen | 201, statut en_attente | P1 | |
| SIG-E2E-02 | E | GET /signalements — moderateur | GET moderateur | 200 | P1 | |
| SIG-E2E-03 | E | GET /signalements — citoyen | GET citoyen | 403 | P1 | |
| SIG-E2E-04 | E | GET /signalements?statut=EN_ATTENTE | GET avec filtre | 200 | P2 | |
| SIG-E2E-05 | E | PATCH /signalements/:id | PATCH moderateur | 200, dateTraitement defini | P1 | |

---

## 8. Upload photo profil

| ID | Type | Description | Etapes | Attendu | Priorite | Statut |
|---|---|---|---|---|---|---|
| USR-U-PHOTO-01 | U | uploadPhoto | `uploadPhoto(1, file)` | `update` appele avec photoProfil | P2 | |
| USR-U-PHOTO-02 | U | deletePhoto | `deletePhoto(1)` | photoProfil: null + fichier supprime | P2 | |
| UPL-E2E-01 | E | POST /utilisateurs/:id/photo — PNG | Multipart PNG 1x1 | 201, photoProfil =~ /^\/uploads\/photo-/ | P1 | |
| UPL-E2E-02 | E | POST /utilisateurs/:id/photo — non-image | Multipart TXT | 400 | P1 | |
| UPL-E2E-03 | E | DELETE /utilisateurs/:id/photo | Fichier existant | 200, photoProfil null | P1 | |

---

## 9. Autres services (unitaire)

### Tags

| ID | Description | Attendu | Priorite | Statut |
|---|---|---|---|---|
| TAG-U-01 | findAll | Liste tags | P2 | |
| TAG-U-02 | create doublon | `ConflictException` | P1 | |
| TAG-U-03 | addToRessource | `upsert` avec cle composite | P2 | |
| TAG-U-04 | removeFromRessource | `delete` avec `idRessource_idTag` | P2 | |

### Commentaires

| ID | Description | Attendu | Priorite | Statut |
|---|---|---|---|---|
| COM-U-01 | findByRessource | Uniquement VISIBLE, sans parentId | P2 | |
| COM-U-02 | create | Commentaire cree | P1 | |
| COM-U-03 | update | dateModification mis a jour | P2 | |
| COM-U-04 | remove | `delete` appele | P2 | |

### Favoris

| ID | Description | Attendu | Priorite | Statut |
|---|---|---|---|---|
| FAV-U-01 | findByUtilisateur | Include dateAjoutFavori, auteur, categorie | P2 | |
| FAV-U-02 | isFavori | `findFirst` avec idUtilisateur+idRessource | P2 | |
| FAV-U-03 | add doublon | `ConflictException` si P2002 | P1 | |
| FAV-U-04 | remove | `delete` avec cle composite | P2 | |

### Progressions

| ID | Description | Attendu | Priorite | Statut |
|---|---|---|---|---|
| PRO-U-01 | findByUtilisateur | Liste progressions | P2 | |
| PRO-U-02 | findByUtilisateur filtre type | Clause `typeProgression` | P2 | |
| PRO-U-03 | create | Progression creee | P1 | |
| PRO-U-04 | update | Progression mise a jour | P2 | |
| PRO-U-05 | remove | `delete` appele | P2 | |

---

## Recapitulatif

| Module | Tests unitaires | Tests e2e | Total |
|---|---|---|---|
| Auth (service + gardes) | 22 | 9 | 31 |
| Utilisateurs | 8 | 10 | 18 |
| Ressources | 8 | 10 | 18 |
| Categories | 6 | 8 | 14 |
| Messagerie | 8 | 3 | 11 |
| Amis | 9 | 3 | 12 |
| Signalements | 5 | 5 | 10 |
| Upload photo | 2 | 3 | 5 |
| Tags | 4 | 0 | 4 |
| Commentaires | 4 | 0 | 4 |
| Favoris | 4 | 0 | 4 |
| Progressions | 5 | 0 | 5 |
| **TOTAL** | **85** | **51** | **136** |
