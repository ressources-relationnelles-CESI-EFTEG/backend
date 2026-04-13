/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  RoleUtilisateur,
  StatutRessource,
  StatutUtilisateur,
  TypeRessource,
  VisibiliteRessource,
} from '@prisma/client';

let id = 1;
const nextId = () => id++;

export function makeUser(overrides: Partial<any> = {}) {
  const idUtilisateur = overrides.idUtilisateur ?? nextId();
  return {
    idUtilisateur,
    nom: 'Doe',
    prenom: 'John',
    email: `user${idUtilisateur}@example.com`,
    motDePasse: '$2a$10$hashedpassword',
    telephone: null,
    description: null,
    phraseAccroche: null,
    region: null,
    photoProfil: null,
    dateNaissance: null,
    dateCreation: new Date('2024-01-01T00:00:00Z'),
    franceConnectId: null,
    statut: StatutUtilisateur.ACTIF,
    role: RoleUtilisateur.CITOYEN,
    ...overrides,
  };
}

export function makeRessource(overrides: Partial<any> = {}) {
  const idRessource = overrides.idRessource ?? nextId();
  return {
    idRessource,
    idUtilisateur: 1,
    idCategorie: 1,
    titre: 'Titre ressource',
    description: 'Description',
    contenu: 'Contenu de la ressource',
    typeRessource: TypeRessource.ARTICLE,
    typeRelation: null,
    niveauDifficulte: null,
    visibilite: VisibiliteRessource.PUBLIQUE,
    lienPartage: null,
    dateCreation: new Date('2024-02-01T00:00:00Z'),
    dateModification: null,
    statut: StatutRessource.VALIDEE,
    motifRejet: null,
    nombreVues: 0,
    ...overrides,
  };
}

export function makeCategorie(overrides: Partial<any> = {}) {
  const idCategorie = overrides.idCategorie ?? nextId();
  return {
    idCategorie,
    nom: 'Catégorie',
    description: null,
    parentId: null,
    ...overrides,
  };
}

export function makeMessage(overrides: Partial<any> = {}) {
  const idMessage = overrides.idMessage ?? nextId();
  return {
    idMessage,
    idConversation: 1,
    idUtilisateur: 1,
    contenu: 'Hello',
    dateEnvoi: new Date('2024-03-01T00:00:00Z'),
    lu: false,
    ...overrides,
  };
}

export function makeConversation(overrides: Partial<any> = {}) {
  const idConversation = overrides.idConversation ?? nextId();
  return {
    idConversation,
    dateCreation: new Date('2024-03-01T00:00:00Z'),
    ...overrides,
  };
}

/** Simulate the Prisma unique-constraint error (P2002). */
export function uniqueConstraintError(target = 'email') {
  const err: any = new Error('Unique constraint failed');
  err.code = 'P2002';
  err.meta = { target: [target] };
  return err;
}

/** Reset the internal id counter — call in `beforeEach` if isolation matters. */
export function resetFixtureIds() {
  id = 1;
}
