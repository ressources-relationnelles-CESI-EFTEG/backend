# Proces-Verbal de Recette — Backend Ressources Relationnelles

**Projet** : Ressources Relationnelles
**Module** : Backend NestJS
**Version testee** : feat/add-tests (commit 421b5bb)
**Date de recette** : 2026-04-13
**Environnement** : Test local (PostgreSQL 16, port 5434)
**Responsable recette** : Fred
**Testeur(s)** : Fred

---

## 1. Contexte

Ce document atteste de la bonne execution des tests de recette sur le backend de l'application Ressources Relationnelles. Il est etabli a l'issue de la campagne de tests definie dans le cahier de tests.

---

## 2. Resultats par module

### 2.1 Authentification

| ID | Cas de test | Statut | Anomalie |
|---|---|---|---|
| AUTH-E2E-01 | Inscription utilisateur (201) | [x] OK / [ ] KO | |
| AUTH-E2E-02 | Inscription doublon email (409) | [x] OK / [ ] KO | |
| AUTH-E2E-03 | Inscription mots de passe non identiques (400) | [x] OK / [ ] KO | |
| AUTH-E2E-04 | Connexion valide (201 + token) | [x] OK / [ ] KO | |
| AUTH-E2E-05 | Connexion mauvais mot de passe (401) | [x] OK / [ ] KO | |
| AUTH-E2E-06 | Acces route protegee sans token (401) | [x] OK / [ ] KO | |
| AUTH-E2E-07 | Acces route protegee avec token valide (200) | [x] OK / [ ] KO | |
| AUTH-E2E-08 | Creation admin par super_admin (201) | [x] OK / [ ] KO | |
| AUTH-E2E-09 | Creation admin par citoyen (403) | [x] OK / [ ] KO | |

### 2.2 Utilisateurs

| ID | Cas de test | Statut | Anomalie |
|---|---|---|---|
| USR-E2E-01 | Liste utilisateurs — admin (200) | [x] OK / [ ] KO | |
| USR-E2E-02 | Liste utilisateurs — citoyen (403) | [x] OK / [ ] KO | |
| USR-E2E-03 | Profil utilisateur par ID (200, sans motDePasse) | [x] OK / [ ] KO | |
| USR-E2E-04 | Profil utilisateur inexistant (404) | [x] OK / [ ] KO | |
| USR-E2E-05 | Modification profil owner (200) | [x] OK / [ ] KO | |
| USR-E2E-06 | Modification statut — admin (200) | [x] OK / [ ] KO | |
| USR-E2E-07 | Modification statut — citoyen (403) | [x] OK / [ ] KO | |
| USR-E2E-08 | Modification role — admin (200) | [x] OK / [ ] KO | |
| USR-E2E-09 | Suppression utilisateur — admin (200) | [x] OK / [ ] KO | |
| USR-E2E-10 | Suppression utilisateur — citoyen (403) | [x] OK / [ ] KO | |

### 2.3 Ressources

| ID | Cas de test | Statut | Anomalie |
|---|---|---|---|
| RES-E2E-01 | Liste ressources publiques validees (200) | [x] OK / [ ] KO | |
| RES-E2E-02 | Filtre ressources par categorie (200) | [x] OK / [ ] KO | |
| RES-E2E-03 | Detail ressource (200) | [x] OK / [ ] KO | |
| RES-E2E-04 | Detail ressource inexistante (404) | [x] OK / [ ] KO | |
| RES-E2E-05 | Ressources par utilisateur (200) | [x] OK / [ ] KO | |
| RES-E2E-06 | Creation ressource authentifiee (201) | [x] OK / [ ] KO | |
| RES-E2E-07 | Creation ressource non authentifiee (401) | [x] OK / [ ] KO | |
| RES-E2E-08 | Modification ressource — moderateur (200) | [x] OK / [ ] KO | |
| RES-E2E-09 | Modification ressource — citoyen (403) | [x] OK / [ ] KO | |
| RES-E2E-10 | Suppression ressource — moderateur (200) | [x] OK / [ ] KO | |

### 2.4 Categories

| ID | Cas de test | Statut | Anomalie |
|---|---|---|---|
| CAT-E2E-01 | Liste categories (200) | [x] OK / [ ] KO | |
| CAT-E2E-02 | Detail categorie (200) | [x] OK / [ ] KO | |
| CAT-E2E-03 | Categorie inexistante (404) | [x] OK / [ ] KO | |
| CAT-E2E-04 | Creation — admin (201) | [x] OK / [ ] KO | |
| CAT-E2E-05 | Creation — citoyen (403) | [x] OK / [ ] KO | |
| CAT-E2E-06 | Modification — admin (200) | [x] OK / [ ] KO | |
| CAT-E2E-07 | Suppression — admin (200) | [x] OK / [ ] KO | |
| CAT-E2E-08 | Suppression — citoyen (403) | [x] OK / [ ] KO | |

### 2.5 Messagerie

| ID | Cas de test | Statut | Anomalie |
|---|---|---|---|
| MSG-E2E-01 | Creation conversation (201) | [x] OK / [ ] KO | |
| MSG-E2E-02 | Envoi message (201) | [x] OK / [ ] KO | |
| MSG-E2E-03 | Listage messages conversation (200) | [x] OK / [ ] KO | |
| MSG-E2E-04 | Comptage messages non-lus (200) | [x] OK / [ ] KO | |
| MSG-E2E-05 | Marquage messages comme lus (200) | [x] OK / [ ] KO | |
| MSG-E2E-06 | Non-lus apres lecture = 0 (200) | [x] OK / [ ] KO | |
| MSG-E2E-07 | Conversations par utilisateur (200) | [x] OK / [ ] KO | |
| MSG-E2E-08 | Conversation inexistante (404) | [x] OK / [ ] KO | |

### 2.6 Amis

| ID | Cas de test | Statut | Anomalie |
|---|---|---|---|
| AMI-E2E-01 | Envoi demande d'amitie (201, EN_ATTENTE) | [x] OK / [ ] KO | |
| AMI-E2E-02 | Demandes recues (200) | [x] OK / [ ] KO | |
| AMI-E2E-03 | Demandes envoyees (200) | [x] OK / [ ] KO | |
| AMI-E2E-04 | Acceptation demande (200, ACCEPTE) | [x] OK / [ ] KO | |
| AMI-E2E-05 | Liste amis apres acceptation (200, 1 ami) | [x] OK / [ ] KO | |
| AMI-E2E-06 | Suppression ami (200) | [x] OK / [ ] KO | |
| AMI-E2E-07 | Refus demande (200, REFUSE) | [x] OK / [ ] KO | |
| AMI-E2E-08 | Double demande (409) | [x] OK / [ ] KO | |

### 2.7 Signalements

| ID | Cas de test | Statut | Anomalie |
|---|---|---|---|
| SIG-E2E-01 | Signalement ressource par citoyen (201) | [x] OK / [ ] KO | |
| SIG-E2E-02 | Liste signalements — moderateur (200) | [x] OK / [ ] KO | |
| SIG-E2E-03 | Liste signalements — citoyen (403) | [x] OK / [ ] KO | |
| SIG-E2E-04 | Filtre par statut (200) | [x] OK / [ ] KO | |
| SIG-E2E-05 | Traitement signalement (200, TRAITE, dateTraitement) | [x] OK / [ ] KO | |

### 2.8 Upload photo profil

| ID | Cas de test | Statut | Anomalie |
|---|---|---|---|
| UPL-E2E-01 | Upload image PNG (201, photoProfil mis a jour) | [x] OK / [ ] KO | |
| UPL-E2E-02 | Upload fichier non-image (400) | [x] OK / [ ] KO | |
| UPL-E2E-03 | Suppression photo (200, photoProfil null) | [x] OK / [ ] KO | |

---

## 3. Bilan

| Categorie | Nombre | Taux |
|---|---|---|
| Cas executes | 59 / 59 | 100% |
| Cas valides (OK) | 59 | 100% |
| Cas en echec (KO) | 0 | 0% |

---

## 4. Anomalies detectees

Aucune anomalie detectee lors de cette campagne de recette.

---

## 5. Conclusion

- [x] **Recette ACCEPTEE** — tous les cas critiques sont verts, aucune anomalie.

---

## 6. Signatures

| Role | Nom | Date | Signature |
|---|---|---|---|
| Responsable technique | Fred | 2026-04-13 | |
| Responsable recette client | | | |
| Chef de projet | | | |
