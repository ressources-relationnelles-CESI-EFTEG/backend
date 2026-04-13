import 'dotenv/config';
import { genSalt, hash } from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  NiveauDifficulte,
  Prisma,
  PrismaClient,
  RoleUtilisateur,
  StatutAmi,
  StatutRessource,
  TypeProgression,
  TypeRelation,
  TypeRessource,
  TypeSignalement,
  VisibiliteRessource,
} from '@prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Missing DATABASE_URL in backend/.env');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({
  adapter: adapter as Prisma.PrismaClientOptions['adapter'],
});

async function main() {
  const salt = await genSalt(10);
  const hashedPassword = await hash('Password123!', salt);

  await prisma.signalement.deleteMany();
  await prisma.progression.deleteMany();
  await prisma.favori.deleteMany();
  await prisma.commentaire.deleteMany();
  await prisma.ressourceTag.deleteMany();
  await prisma.ami.deleteMany();
  await prisma.ressource.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.categorie.deleteMany();
  await prisma.utilisateur.deleteMany();

  const superAdmin = await prisma.utilisateur.create({
    data: {
      email: 'superadmin@rr.local',
      motDePasse: hashedPassword,
      nom: 'Ressources',
      prenom: 'Admin',
      role: RoleUtilisateur.SUPER_ADMIN,
      franceConnectId: 'fc-superadmin-rr',
    },
  });

  const moderateur = await prisma.utilisateur.create({
    data: {
      email: 'moderateur@rr.local',
      motDePasse: hashedPassword,
      nom: 'Dupont',
      prenom: 'Camille',
      role: RoleUtilisateur.MODERATEUR,
      dateNaissance: new Date('1992-07-10'),
      franceConnectId: 'fc-modo-rr',
    },
  });

  const alice = await prisma.utilisateur.create({
    data: {
      email: 'alice@rr.local',
      motDePasse: hashedPassword,
      nom: 'Martin',
      prenom: 'Alice',
      dateNaissance: new Date('1998-04-20'),
      franceConnectId: 'fc-alice-rr',
    },
  });

  const bob = await prisma.utilisateur.create({
    data: {
      email: 'bob@rr.local',
      motDePasse: hashedPassword,
      nom: 'Lopez',
      prenom: 'Bob',
      dateNaissance: new Date('1995-11-04'),
      franceConnectId: 'fc-bob-rr',
    },
  });

  const parentalite = await prisma.categorie.create({
    data: {
      nom: 'Parentalite',
      description: 'Ressources pour les relations parents-enfants.',
    },
  });

  const couple = await prisma.categorie.create({
    data: {
      nom: 'Couple',
      description: 'Communication et gestion des conflits dans le couple.',
    },
  });

  const communication = await prisma.categorie.create({
    data: {
      nom: 'Communication non violente',
      description: 'Techniques de communication pour des echanges apaises.',
      parentId: couple.idCategorie,
    },
  });

  await prisma.tag.createMany({
    data: [
      { nom: 'communication' },
      { nom: 'ecoute' },
      { nom: 'conflit' },
      { nom: 'emotions' },
      { nom: 'ado' },
      { nom: 'couple' },
    ],
  });

  const tags = await prisma.tag.findMany({
    where: {
      nom: {
        in: ['communication', 'ecoute', 'conflit', 'emotions', 'ado', 'couple'],
      },
    },
    select: { idTag: true, nom: true },
  });

  const tagByName = new Map<string, number>(
    tags.map((tag) => [tag.nom, tag.idTag]),
  );

  const ressource1 = await prisma.ressource.create({
    data: {
      idUtilisateur: alice.idUtilisateur,
      idCategorie: communication.idCategorie,
      titre: 'Mieux parler en cas de tension',
      description: 'Guide pratique pour structurer une conversation difficile.',
      contenu:
        'Commence par decrire les faits, exprime ton ressenti, formule ton besoin puis termine avec une demande concrete.',
      typeRessource: TypeRessource.ARTICLE,
      typeRelation: TypeRelation.COUPLE,
      niveauDifficulte: NiveauDifficulte.DEBUTANT,
      visibilite: VisibiliteRessource.PUBLIQUE,
      lienPartage: 'rr-mieux-parler-tension',
      statut: StatutRessource.VALIDEE,
      nombreVues: 128,
    },
  });

  const ressource2 = await prisma.ressource.create({
    data: {
      idUtilisateur: bob.idUtilisateur,
      idCategorie: parentalite.idCategorie,
      titre: 'Routine de discussion parent-ado',
      description: 'Activite hebdomadaire en 20 minutes.',
      contenu:
        'Fixer un rendez-vous court, alterner les temps de parole, reformuler, puis definir une action test pour la semaine suivante.',
      typeRessource: TypeRessource.ACTIVITE,
      typeRelation: TypeRelation.FAMILLE,
      niveauDifficulte: NiveauDifficulte.INTERMEDIAIRE,
      visibilite: VisibiliteRessource.PARTAGEE,
      lienPartage: 'rr-routine-parent-ado',
      statut: StatutRessource.EN_ATTENTE,
      nombreVues: 42,
    },
  });

  const ressource3 = await prisma.ressource.create({
    data: {
      idUtilisateur: alice.idUtilisateur,
      idCategorie: couple.idCategorie,
      titre: 'Exercice de desescalade emotionnelle',
      description: 'Audio court pour revenir a un echange constructif.',
      contenu:
        'Respiration guidee 4-6, pause de 10 minutes, reprise avec reformulation des besoins de chacun.',
      typeRessource: TypeRessource.AUDIO,
      typeRelation: TypeRelation.COUPLE,
      niveauDifficulte: NiveauDifficulte.DEBUTANT,
      visibilite: VisibiliteRessource.PRIVEE,
      statut: StatutRessource.BROUILLON,
      nombreVues: 5,
    },
  });

  await prisma.ressourceTag.createMany({
    data: [
      {
        idRessource: ressource1.idRessource,
        idTag: tagByName.get('communication')!,
      },
      { idRessource: ressource1.idRessource, idTag: tagByName.get('conflit')! },
      { idRessource: ressource1.idRessource, idTag: tagByName.get('couple')! },
      { idRessource: ressource2.idRessource, idTag: tagByName.get('ecoute')! },
      { idRessource: ressource2.idRessource, idTag: tagByName.get('ado')! },
      {
        idRessource: ressource3.idRessource,
        idTag: tagByName.get('emotions')!,
      },
    ],
  });

  const commentaire1 = await prisma.commentaire.create({
    data: {
      idUtilisateur: bob.idUtilisateur,
      idRessource: ressource1.idRessource,
      contenu:
        'Article clair, les exemples m ont aide a mieux formuler mes demandes.',
    },
  });

  await prisma.commentaire.create({
    data: {
      idUtilisateur: alice.idUtilisateur,
      idRessource: ressource1.idRessource,
      idCommentaireParent: commentaire1.idCommentaire,
      contenu: 'Merci pour ton retour, je vais ajouter une fiche resume.',
    },
  });

  await prisma.favori.createMany({
    data: [
      {
        idUtilisateur: alice.idUtilisateur,
        idRessource: ressource2.idRessource,
      },
      { idUtilisateur: bob.idUtilisateur, idRessource: ressource1.idRessource },
    ],
  });

  await prisma.progression.createMany({
    data: [
      {
        idUtilisateur: alice.idUtilisateur,
        idRessource: ressource1.idRessource,
        typeProgression: TypeProgression.EXPLOITEE,
      },
      {
        idUtilisateur: alice.idUtilisateur,
        idRessource: ressource2.idRessource,
        typeProgression: TypeProgression.MISE_DE_COTE,
        rappelJours: 7,
      },
      {
        idUtilisateur: bob.idUtilisateur,
        idRessource: ressource1.idRessource,
        typeProgression: TypeProgression.MISE_DE_COTE,
        rappelJours: 14,
      },
    ],
  });

  await prisma.signalement.create({
    data: {
      idUtilisateur: alice.idUtilisateur,
      typeSignalement: TypeSignalement.RESSOURCE,
      idRessource: ressource2.idRessource,
      motif: 'Le contenu devrait citer ses sources plus explicitement.',
      idModerateur: moderateur.idUtilisateur,
      actionPrise: 'Demande de correction envoyee a l auteur',
      dateTraitement: new Date('2026-03-01T09:30:00Z'),
    },
  });

  await prisma.ami.createMany({
    data: [
      {
        idUtilisateur1: alice.idUtilisateur,
        idUtilisateur2: bob.idUtilisateur,
        statut: StatutAmi.ACCEPTE,
      },
      {
        idUtilisateur1: bob.idUtilisateur,
        idUtilisateur2: superAdmin.idUtilisateur,
        statut: StatutAmi.EN_ATTENTE,
      },
    ],
  });
}

void main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
