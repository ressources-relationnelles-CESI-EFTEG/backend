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
  StatutSignalement,
  StatutUtilisateur,
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

  // Nettoyage dans l'ordre inverse des dépendances
  await prisma.message.deleteMany();
  await prisma.participantConversation.deleteMany();
  await prisma.conversation.deleteMany();
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

  // ─── Utilisateurs : 1 par rôle ─────────────────────────────────────────────
  const superAdmin = await prisma.utilisateur.create({
    data: {
      email: 'superadmin@rr.local',
      motDePasse: hashedPassword,
      nom: 'Durand',
      prenom: 'Sophie',
      telephone: '+33 6 00 00 00 01',
      region: 'Île-de-France',
      phraseAccroche: 'Garante de la plateforme, à l\'écoute de tous.',
      description:
        'Super administratrice de la plateforme Ressources (Re)lationnelles. Supervise les équipes de modération et d\'administration.',
      dateNaissance: new Date('1985-02-14'),
      role: RoleUtilisateur.SUPER_ADMIN,
      statut: StatutUtilisateur.ACTIF,
      franceConnectId: 'fc-superadmin-rr',
    },
  });

  const administrateur = await prisma.utilisateur.create({
    data: {
      email: 'admin@rr.local',
      motDePasse: hashedPassword,
      nom: 'Leroy',
      prenom: 'Julien',
      telephone: '+33 6 00 00 00 02',
      region: 'Auvergne-Rhône-Alpes',
      phraseAccroche: 'Administration et pilotage de la communauté.',
      description:
        'Administrateur en charge de la gestion des comptes et des rôles sur la plateforme.',
      dateNaissance: new Date('1988-09-22'),
      role: RoleUtilisateur.ADMINISTRATEUR,
      statut: StatutUtilisateur.ACTIF,
      franceConnectId: 'fc-admin-rr',
    },
  });

  const moderateur = await prisma.utilisateur.create({
    data: {
      email: 'moderateur@rr.local',
      motDePasse: hashedPassword,
      nom: 'Dupont',
      prenom: 'Camille',
      telephone: '+33 6 00 00 00 03',
      region: 'Nouvelle-Aquitaine',
      phraseAccroche: 'Accompagner les échanges dans le respect de chacun.',
      description:
        'Modératrice bénévole, spécialisée dans la médiation familiale et la communication non violente.',
      dateNaissance: new Date('1992-07-10'),
      role: RoleUtilisateur.MODERATEUR,
      statut: StatutUtilisateur.ACTIF,
      franceConnectId: 'fc-modo-rr',
    },
  });

  const citoyen = await prisma.utilisateur.create({
    data: {
      email: 'citoyen@rr.local',
      motDePasse: hashedPassword,
      nom: 'Martin',
      prenom: 'Alice',
      telephone: '+33 6 00 00 00 04',
      region: 'Bretagne',
      phraseAccroche: 'Partager pour mieux se comprendre.',
      description:
        'Citoyenne engagée, intéressée par les ressources sur la communication et la parentalité.',
      dateNaissance: new Date('1998-04-20'),
      role: RoleUtilisateur.CITOYEN,
      statut: StatutUtilisateur.ACTIF,
      franceConnectId: 'fc-citoyen-rr',
    },
  });

  // ─── Catégories ────────────────────────────────────────────────────────────
  const parentalite = await prisma.categorie.create({
    data: {
      nom: 'Parentalité',
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
      description: 'Techniques de communication pour des échanges apaisés.',
      parentId: couple.idCategorie,
    },
  });

  // ─── Tags ──────────────────────────────────────────────────────────────────
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
    select: { idTag: true, nom: true },
  });
  const tagByName = new Map<string, number>(
    tags.map((tag) => [tag.nom, tag.idTag]),
  );

  // ─── Ressources ────────────────────────────────────────────────────────────
  const ressource1 = await prisma.ressource.create({
    data: {
      idUtilisateur: citoyen.idUtilisateur,
      idCategorie: communication.idCategorie,
      titre: 'Mieux parler en cas de tension',
      description: 'Guide pratique pour structurer une conversation difficile.',
      contenu:
        'Commence par décrire les faits, exprime ton ressenti, formule ton besoin puis termine avec une demande concrète.',
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
      idUtilisateur: moderateur.idUtilisateur,
      idCategorie: parentalite.idCategorie,
      titre: 'Routine de discussion parent-ado',
      description: 'Activité hebdomadaire en 20 minutes.',
      contenu:
        'Fixer un rendez-vous court, alterner les temps de parole, reformuler, puis définir une action test pour la semaine suivante.',
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
      idUtilisateur: citoyen.idUtilisateur,
      idCategorie: couple.idCategorie,
      titre: 'Exercice de désescalade émotionnelle',
      description: 'Audio court pour revenir à un échange constructif.',
      contenu:
        'Respiration guidée 4-6, pause de 10 minutes, reprise avec reformulation des besoins de chacun.',
      typeRessource: TypeRessource.AUDIO,
      typeRelation: TypeRelation.COUPLE,
      niveauDifficulte: NiveauDifficulte.DEBUTANT,
      visibilite: VisibiliteRessource.PRIVEE,
      statut: StatutRessource.BROUILLON,
      nombreVues: 5,
    },
  });

  // ─── Association tags ↔ ressources ────────────────────────────────────────
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

  // ─── Commentaires (avec réponse) ──────────────────────────────────────────
  const commentaire1 = await prisma.commentaire.create({
    data: {
      idUtilisateur: moderateur.idUtilisateur,
      idRessource: ressource1.idRessource,
      contenu:
        'Article clair, les exemples aident vraiment à formuler les demandes.',
    },
  });

  await prisma.commentaire.create({
    data: {
      idUtilisateur: citoyen.idUtilisateur,
      idRessource: ressource1.idRessource,
      idCommentaireParent: commentaire1.idCommentaire,
      contenu: 'Merci pour ton retour, je vais ajouter une fiche résumé.',
    },
  });

  // ─── Favoris ──────────────────────────────────────────────────────────────
  await prisma.favori.createMany({
    data: [
      {
        idUtilisateur: citoyen.idUtilisateur,
        idRessource: ressource2.idRessource,
      },
      {
        idUtilisateur: moderateur.idUtilisateur,
        idRessource: ressource1.idRessource,
      },
    ],
  });

  // ─── Progressions ─────────────────────────────────────────────────────────
  await prisma.progression.createMany({
    data: [
      {
        idUtilisateur: citoyen.idUtilisateur,
        idRessource: ressource1.idRessource,
        typeProgression: TypeProgression.EXPLOITEE,
      },
      {
        idUtilisateur: citoyen.idUtilisateur,
        idRessource: ressource2.idRessource,
        typeProgression: TypeProgression.MISE_DE_COTE,
        rappelJours: 7,
      },
      {
        idUtilisateur: moderateur.idUtilisateur,
        idRessource: ressource1.idRessource,
        typeProgression: TypeProgression.MISE_DE_COTE,
        rappelJours: 14,
      },
    ],
  });

  // ─── Signalements : un par statut ─────────────────────────────────────────
  await prisma.signalement.create({
    data: {
      idUtilisateur: citoyen.idUtilisateur,
      typeSignalement: TypeSignalement.RESSOURCE,
      idRessource: ressource2.idRessource,
      motif: 'Le contenu devrait citer ses sources plus explicitement.',
      statut: StatutSignalement.EN_ATTENTE,
    },
  });

  await prisma.signalement.create({
    data: {
      idUtilisateur: citoyen.idUtilisateur,
      typeSignalement: TypeSignalement.COMMENTAIRE,
      idCommentaire: commentaire1.idCommentaire,
      motif: 'Commentaire à vérifier (doute sur la formulation).',
      statut: StatutSignalement.TRAITE,
      idModerateur: moderateur.idUtilisateur,
      actionPrise: 'Commentaire conservé après vérification.',
      dateTraitement: new Date('2026-03-01T09:30:00Z'),
    },
  });

  await prisma.signalement.create({
    data: {
      idUtilisateur: citoyen.idUtilisateur,
      typeSignalement: TypeSignalement.RESSOURCE,
      idRessource: ressource1.idRessource,
      motif: 'Faux positif — ressource conforme.',
      statut: StatutSignalement.IGNORE,
      idModerateur: moderateur.idUtilisateur,
      actionPrise: 'Aucune action : ressource conforme.',
      dateTraitement: new Date('2026-03-05T14:00:00Z'),
    },
  });

  // ─── Amitiés : une acceptée + une en attente ──────────────────────────────
  await prisma.ami.createMany({
    data: [
      {
        idUtilisateur1: citoyen.idUtilisateur,
        idUtilisateur2: moderateur.idUtilisateur,
        statut: StatutAmi.ACCEPTE,
      },
      {
        idUtilisateur1: citoyen.idUtilisateur,
        idUtilisateur2: administrateur.idUtilisateur,
        statut: StatutAmi.EN_ATTENTE,
      },
    ],
  });

  // ─── Messagerie : 2 conversations ─────────────────────────────────────────
  // Conversation 1 : citoyen ↔ moderateur (échange court)
  const conv1 = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { idUtilisateur: citoyen.idUtilisateur },
          { idUtilisateur: moderateur.idUtilisateur },
        ],
      },
    },
  });

  await prisma.message.create({
    data: {
      idConversation: conv1.idConversation,
      idUtilisateur: citoyen.idUtilisateur,
      contenu: 'Bonjour, j\'ai une question sur la modération des ressources.',
      lu: true,
      dateEnvoi: new Date('2026-04-15T09:00:00Z'),
    },
  });

  await prisma.message.create({
    data: {
      idConversation: conv1.idConversation,
      idUtilisateur: moderateur.idUtilisateur,
      contenu: 'Bonjour Alice, avec plaisir. Quelle est votre question ?',
      lu: true,
      dateEnvoi: new Date('2026-04-15T09:05:00Z'),
    },
  });

  await prisma.message.create({
    data: {
      idConversation: conv1.idConversation,
      idUtilisateur: citoyen.idUtilisateur,
      contenu:
        'Je voulais savoir combien de temps prend la validation d\'une nouvelle ressource en moyenne.',
      lu: false,
      dateEnvoi: new Date('2026-04-15T09:07:00Z'),
    },
  });

  // Conversation 2 : groupe citoyen + moderateur + administrateur
  const conv2 = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { idUtilisateur: citoyen.idUtilisateur },
          { idUtilisateur: moderateur.idUtilisateur },
          { idUtilisateur: administrateur.idUtilisateur },
        ],
      },
    },
  });

  await prisma.message.create({
    data: {
      idConversation: conv2.idConversation,
      idUtilisateur: administrateur.idUtilisateur,
      contenu:
        'Bienvenue dans ce groupe d\'échange autour de la plateforme Ressources Relationnelles.',
      lu: true,
      dateEnvoi: new Date('2026-04-10T14:00:00Z'),
    },
  });

  await prisma.message.create({
    data: {
      idConversation: conv2.idConversation,
      idUtilisateur: moderateur.idUtilisateur,
      contenu: 'Merci pour l\'invitation, ravie de rejoindre le groupe.',
      lu: true,
      dateEnvoi: new Date('2026-04-10T14:02:00Z'),
    },
  });

  await prisma.message.create({
    data: {
      idConversation: conv2.idConversation,
      idUtilisateur: citoyen.idUtilisateur,
      contenu: 'Bonjour à tous, hâte de partager des retours d\'expérience !',
      lu: false,
      dateEnvoi: new Date('2026-04-10T14:10:00Z'),
    },
  });

  console.log('Seed terminé : 4 utilisateurs (1 par rôle), données liées complètes.');
}

void main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
