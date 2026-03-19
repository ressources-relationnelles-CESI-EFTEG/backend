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
npx prisma db seed
npm run start:dev
```

---Si vous avez déjà migrer une fois avec l'ancienne base il faut reset---
```powershell
npm run db:reset
npm run db:up
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

API Nest: `http://localhost:3001`

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

## Endpoints API

### Utilisateurs `/utilisateurs`

| Methode | Route | Description | Reponse |
|---------|-------|-------------|---------|
| GET | `/utilisateurs` | Lister les utilisateurs (`?search=` pour rechercher) | `[{ idUtilisateur, nom, prenom, email, telephone, description, phraseAccroche, region, photoProfil, dateNaissance, dateCreation, statut, role }]` |
| GET | `/utilisateurs/:id` | Profil d'un utilisateur | `{ idUtilisateur, nom, prenom, email, telephone, description, phraseAccroche, region, photoProfil, dateNaissance, dateCreation, statut, role }` |
| PATCH | `/utilisateurs/:id` | Modifier un utilisateur | Utilisateur mis a jour |
| PATCH | `/utilisateurs/:id/statut` | Changer le statut (ACTIF, INACTIF, SUSPENDU) | Utilisateur mis a jour |
| PATCH | `/utilisateurs/:id/role` | Changer le role | Utilisateur mis a jour |
| POST | `/utilisateurs/:id/photo` | Upload photo de profil (form-data, champ `photo`) | Utilisateur mis a jour avec `photoProfil` |
| DELETE | `/utilisateurs/:id/photo` | Supprimer la photo de profil | Utilisateur mis a jour |
| DELETE | `/utilisateurs/:id` | Supprimer un utilisateur | Utilisateur supprime |

### Ressources `/ressources`

| Methode | Route | Description | Reponse |
|---------|-------|-------------|---------|
| GET | `/ressources` | Lister les ressources publiques validees (`?categorie=` pour filtrer) | `[{ idRessource, titre, description, contenu, typeRessource, typeRelation, niveauDifficulte, visibilite, statut, nombreVues, dateCreation, categorie: { idCategorie, nom }, utilisateur: { idUtilisateur, prenom, nom }, tags: [{ tag: { idTag, nom } }] }]` |
| GET | `/ressources/:id` | Detail d'une ressource | Meme objet que ci-dessus (unitaire) |
| GET | `/ressources/utilisateur/:id` | Ressources creees par un utilisateur (tous statuts) | Meme format (tableau) |
| POST | `/ressources` | Creer une ressource | Ressource creee |
| PATCH | `/ressources/:id` | Modifier une ressource | Ressource mise a jour |
| DELETE | `/ressources/:id` | Supprimer une ressource | Ressource supprimee |

### Categories `/categories`

| Methode | Route | Description | Reponse |
|---------|-------|-------------|---------|
| GET | `/categories` | Lister toutes les categories | `[{ idCategorie, nom, description, parentId, enfants: [{ idCategorie, nom, ... }] }]` |
| GET | `/categories/:id` | Detail d'une categorie | Meme objet (unitaire) |
| POST | `/categories` | Creer une categorie | Categorie creee |
| PATCH | `/categories/:id` | Modifier une categorie | Categorie mise a jour |
| DELETE | `/categories/:id` | Supprimer une categorie | Categorie supprimee |

### Commentaires `/commentaires`

| Methode | Route | Description | Reponse |
|---------|-------|-------------|---------|
| GET | `/commentaires/ressource/:id` | Commentaires d'une ressource (racines avec reponses) | `[{ idCommentaire, contenu, dateCreation, statut, utilisateur: { idUtilisateur, prenom, nom }, reponses: [{ idCommentaire, contenu, utilisateur, ... }] }]` |
| GET | `/commentaires/:id` | Detail d'un commentaire | Meme objet (unitaire) |
| POST | `/commentaires` | Creer un commentaire ou une reponse | Commentaire cree |
| PATCH | `/commentaires/:id` | Modifier un commentaire | Commentaire mis a jour |
| DELETE | `/commentaires/:id` | Supprimer un commentaire | Commentaire supprime |

### Favoris `/favoris`

| Methode | Route | Description | Reponse |
|---------|-------|-------------|---------|
| GET | `/favoris/utilisateur/:id` | Favoris d'un utilisateur | `[{ idRessource, titre, description, typeRessource, auteur, categorie, dateAjoutFavori }]` |
| GET | `/favoris/:userId/:ressourceId` | Verifier si une ressource est en favori | `{ favori: true/false }` |
| POST | `/favoris/:userId/:ressourceId` | Ajouter aux favoris | `{ idUtilisateur, idRessource, dateAjout }` |
| DELETE | `/favoris/:userId/:ressourceId` | Retirer des favoris | Favori supprime |

### Tags `/tags`

| Methode | Route | Description | Reponse |
|---------|-------|-------------|---------|
| GET | `/tags` | Lister tous les tags | `[{ idTag, nom }]` |
| GET | `/tags/:id` | Detail d'un tag | `{ idTag, nom }` |
| POST | `/tags` | Creer un tag | Tag cree |
| DELETE | `/tags/:id` | Supprimer un tag | Tag supprime |
| POST | `/tags/ressource/:ressourceId/:tagId` | Associer un tag a une ressource | `{ idRessource, idTag }` |
| DELETE | `/tags/ressource/:ressourceId/:tagId` | Retirer un tag d'une ressource | Association supprimee |

### Signalements `/signalements`

| Methode | Route | Description | Reponse |
|---------|-------|-------------|---------|
| GET | `/signalements` | Lister les signalements (`?statut=` pour filtrer) | `[{ idSignalement, typeSignalement, motif, statut, dateCreation, dateTraitement, actionPrise, utilisateur: { idUtilisateur, prenom, nom }, ressource: { idRessource, titre }, commentaire: { idCommentaire, contenu }, moderateur: { idUtilisateur, prenom, nom } }]` |
| GET | `/signalements/:id` | Detail d'un signalement | Meme objet (unitaire) |
| POST | `/signalements` | Creer un signalement | Signalement cree |
| PATCH | `/signalements/:id` | Traiter un signalement | Signalement mis a jour (dateTraitement auto) |
| DELETE | `/signalements/:id` | Supprimer un signalement | Signalement supprime |

### Messagerie `/messagerie`

| Methode | Route | Description | Reponse |
|---------|-------|-------------|---------|
| GET | `/messagerie/conversations/utilisateur/:id` | Conversations d'un utilisateur | `[{ idConversation, dateCreation, participants: [{ utilisateur: { idUtilisateur, prenom, nom } }], dernierMessage: { idMessage, contenu, dateEnvoi, lu, utilisateur } }]` |
| GET | `/messagerie/conversations/:id` | Detail d'une conversation | `{ idConversation, dateCreation, participants: [...] }` |
| GET | `/messagerie/conversations/:id/messages` | Messages d'une conversation | `[{ idMessage, contenu, dateEnvoi, lu, utilisateur: { idUtilisateur, prenom, nom } }]` |
| GET | `/messagerie/non-lus/:id` | Nombre de messages non lus | `{ nonLus: number }` |
| POST | `/messagerie/conversations` | Creer une conversation | Conversation creee avec participants |
| POST | `/messagerie/conversations/:id/messages` | Envoyer un message | Message cree |
| PATCH | `/messagerie/conversations/:id/lu/:userId` | Marquer les messages comme lus | `{ count: number }` |

### Amis `/amis`

| Methode | Route | Description | Reponse |
|---------|-------|-------------|---------|
| GET | `/amis/utilisateur/:id` | Liste des amis | `[{ ami: { idUtilisateur, prenom, nom }, dateCreation }]` |
| GET | `/amis/demandes/recues/:id` | Demandes recues en attente | `[{ idUtilisateur1, idUtilisateur2, dateCreation, statut, utilisateur1: { idUtilisateur, prenom, nom } }]` |
| GET | `/amis/demandes/envoyees/:id` | Demandes envoyees en attente | `[{ idUtilisateur1, idUtilisateur2, dateCreation, statut, utilisateur2: { idUtilisateur, prenom, nom } }]` |
| POST | `/amis/:userId1/:userId2` | Envoyer une demande d'amitie | `{ idUtilisateur1, idUtilisateur2, dateCreation, statut }` |
| PATCH | `/amis/accepter/:userId1/:userId2` | Accepter une demande | Demande mise a jour (statut: ACCEPTE) |
| PATCH | `/amis/refuser/:userId1/:userId2` | Refuser une demande | Demande mise a jour (statut: REFUSE) |
| DELETE | `/amis/:userId1/:userId2` | Supprimer une amitie | Amitie supprimee |

### Progressions `/progressions`

| Methode | Route | Description | Reponse |
|---------|-------|-------------|---------|
| GET | `/progressions/utilisateur/:id` | Progressions d'un utilisateur (`?type=` pour filtrer) | `[{ idProgression, typeProgression, dateAjout, rappelJours, ressource: { idRessource, titre, typeRessource } }]` |
| GET | `/progressions/:id` | Detail d'une progression | Meme objet (unitaire) |
| POST | `/progressions` | Creer une progression | Progression creee |
| PATCH | `/progressions/:id` | Modifier une progression | Progression mise a jour |
| DELETE | `/progressions/:id` | Supprimer une progression | Progression supprimee |
