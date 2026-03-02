-- CreateEnum
CREATE TYPE "StatutUtilisateur" AS ENUM ('actif', 'inactif', 'suspendu');

-- CreateEnum
CREATE TYPE "RoleUtilisateur" AS ENUM ('citoyen', 'moderateur', 'administrateur', 'super_admin');

-- CreateEnum
CREATE TYPE "TypeRessource" AS ENUM ('article', 'video', 'audio', 'exercice', 'activite', 'jeu');

-- CreateEnum
CREATE TYPE "TypeRelation" AS ENUM ('famille', 'couple', 'amitie', 'professionnel', 'communautaire');

-- CreateEnum
CREATE TYPE "NiveauDifficulte" AS ENUM ('debutant', 'intermediaire', 'avance');

-- CreateEnum
CREATE TYPE "VisibiliteRessource" AS ENUM ('privee', 'partagee', 'publique');

-- CreateEnum
CREATE TYPE "StatutRessource" AS ENUM ('brouillon', 'en_attente', 'validee', 'rejetee');

-- CreateEnum
CREATE TYPE "StatutCommentaire" AS ENUM ('visible', 'masque', 'supprime');

-- CreateEnum
CREATE TYPE "TypeProgression" AS ENUM ('exploitee', 'mise_de_cote');

-- CreateEnum
CREATE TYPE "TypeSignalement" AS ENUM ('ressource', 'commentaire');

-- CreateEnum
CREATE TYPE "StatutSignalement" AS ENUM ('en_attente', 'traite', 'ignore');

-- CreateEnum
CREATE TYPE "StatutAmi" AS ENUM ('en_attente', 'accepte', 'refuse');

-- CreateTable
CREATE TABLE "utilisateur" (
    "id_utilisateur" SERIAL NOT NULL,
    "nom" VARCHAR(100),
    "prenom" VARCHAR(100),
    "email" VARCHAR(255) NOT NULL,
    "mot_de_passe" VARCHAR(255),
    "date_naissance" DATE,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "france_connect_id" VARCHAR(255),
    "statut" "StatutUtilisateur" NOT NULL DEFAULT 'actif',
    "role" "RoleUtilisateur" NOT NULL DEFAULT 'citoyen',

    CONSTRAINT "utilisateur_pkey" PRIMARY KEY ("id_utilisateur")
);

-- CreateTable
CREATE TABLE "categorie" (
    "id_categorie" SERIAL NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "parent_id" INTEGER,

    CONSTRAINT "categorie_pkey" PRIMARY KEY ("id_categorie")
);

-- CreateTable
CREATE TABLE "ressource" (
    "id_ressource" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "id_categorie" INTEGER NOT NULL,
    "titre" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "contenu" TEXT NOT NULL,
    "type_ressource" "TypeRessource",
    "type_relation" "TypeRelation",
    "niveau_difficulte" "NiveauDifficulte",
    "visibilite" "VisibiliteRessource" NOT NULL DEFAULT 'privee',
    "lien_partage" VARCHAR(255),
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3),
    "statut" "StatutRessource" NOT NULL DEFAULT 'brouillon',
    "motif_rejet" TEXT,
    "nombre_vues" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ressource_pkey" PRIMARY KEY ("id_ressource")
);

-- CreateTable
CREATE TABLE "tag" (
    "id_tag" SERIAL NOT NULL,
    "nom" VARCHAR(50) NOT NULL,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id_tag")
);

-- CreateTable
CREATE TABLE "ressource_tag" (
    "id_ressource" INTEGER NOT NULL,
    "id_tag" INTEGER NOT NULL,

    CONSTRAINT "ressource_tag_pkey" PRIMARY KEY ("id_ressource","id_tag")
);

-- CreateTable
CREATE TABLE "commentaire" (
    "id_commentaire" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "id_ressource" INTEGER NOT NULL,
    "id_commentaire_parent" INTEGER,
    "contenu" TEXT NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3),
    "statut" "StatutCommentaire" NOT NULL DEFAULT 'visible',

    CONSTRAINT "commentaire_pkey" PRIMARY KEY ("id_commentaire")
);

-- CreateTable
CREATE TABLE "favori" (
    "id_utilisateur" INTEGER NOT NULL,
    "id_ressource" INTEGER NOT NULL,
    "date_ajout" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favori_pkey" PRIMARY KEY ("id_utilisateur","id_ressource")
);

-- CreateTable
CREATE TABLE "progression" (
    "id_progression" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "id_ressource" INTEGER NOT NULL,
    "type_progression" "TypeProgression" NOT NULL,
    "date_ajout" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rappel_jours" INTEGER,

    CONSTRAINT "progression_pkey" PRIMARY KEY ("id_progression")
);

-- CreateTable
CREATE TABLE "signalement" (
    "id_signalement" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "type_signalement" "TypeSignalement" NOT NULL,
    "id_ressource" INTEGER,
    "id_commentaire" INTEGER,
    "motif" TEXT NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" "StatutSignalement" NOT NULL DEFAULT 'en_attente',
    "id_moderateur" INTEGER,
    "action_prise" VARCHAR(100),
    "date_traitement" TIMESTAMP(3),

    CONSTRAINT "signalement_pkey" PRIMARY KEY ("id_signalement")
);

-- CreateTable
CREATE TABLE "ami" (
    "id_utilisateur1" INTEGER NOT NULL,
    "id_utilisateur2" INTEGER NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" "StatutAmi" NOT NULL DEFAULT 'en_attente',

    CONSTRAINT "ami_pkey" PRIMARY KEY ("id_utilisateur1","id_utilisateur2")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_email_key" ON "utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_france_connect_id_key" ON "utilisateur"("france_connect_id");

-- CreateIndex
CREATE INDEX "ressource_id_utilisateur_idx" ON "ressource"("id_utilisateur");

-- CreateIndex
CREATE INDEX "ressource_id_categorie_idx" ON "ressource"("id_categorie");

-- CreateIndex
CREATE UNIQUE INDEX "ressource_lien_partage_key" ON "ressource"("lien_partage");

-- CreateIndex
CREATE UNIQUE INDEX "tag_nom_key" ON "tag"("nom");

-- CreateIndex
CREATE INDEX "commentaire_id_utilisateur_idx" ON "commentaire"("id_utilisateur");

-- CreateIndex
CREATE INDEX "commentaire_id_ressource_idx" ON "commentaire"("id_ressource");

-- CreateIndex
CREATE INDEX "commentaire_id_commentaire_parent_idx" ON "commentaire"("id_commentaire_parent");

-- CreateIndex
CREATE UNIQUE INDEX "progression_id_utilisateur_id_ressource_type_progression_key" ON "progression"("id_utilisateur", "id_ressource", "type_progression");

-- CreateIndex
CREATE INDEX "progression_id_utilisateur_idx" ON "progression"("id_utilisateur");

-- CreateIndex
CREATE INDEX "progression_id_ressource_idx" ON "progression"("id_ressource");

-- CreateIndex
CREATE INDEX "signalement_id_utilisateur_idx" ON "signalement"("id_utilisateur");

-- CreateIndex
CREATE INDEX "signalement_id_ressource_idx" ON "signalement"("id_ressource");

-- CreateIndex
CREATE INDEX "signalement_id_commentaire_idx" ON "signalement"("id_commentaire");

-- CreateIndex
CREATE INDEX "signalement_id_moderateur_idx" ON "signalement"("id_moderateur");

-- AddForeignKey
ALTER TABLE "categorie" ADD CONSTRAINT "categorie_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categorie"("id_categorie") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ressource" ADD CONSTRAINT "ressource_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ressource" ADD CONSTRAINT "ressource_id_categorie_fkey" FOREIGN KEY ("id_categorie") REFERENCES "categorie"("id_categorie") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ressource_tag" ADD CONSTRAINT "ressource_tag_id_ressource_fkey" FOREIGN KEY ("id_ressource") REFERENCES "ressource"("id_ressource") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ressource_tag" ADD CONSTRAINT "ressource_tag_id_tag_fkey" FOREIGN KEY ("id_tag") REFERENCES "tag"("id_tag") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentaire" ADD CONSTRAINT "commentaire_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentaire" ADD CONSTRAINT "commentaire_id_ressource_fkey" FOREIGN KEY ("id_ressource") REFERENCES "ressource"("id_ressource") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentaire" ADD CONSTRAINT "commentaire_id_commentaire_parent_fkey" FOREIGN KEY ("id_commentaire_parent") REFERENCES "commentaire"("id_commentaire") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favori" ADD CONSTRAINT "favori_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateur"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favori" ADD CONSTRAINT "favori_id_ressource_fkey" FOREIGN KEY ("id_ressource") REFERENCES "ressource"("id_ressource") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progression" ADD CONSTRAINT "progression_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateur"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progression" ADD CONSTRAINT "progression_id_ressource_fkey" FOREIGN KEY ("id_ressource") REFERENCES "ressource"("id_ressource") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalement" ADD CONSTRAINT "signalement_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalement" ADD CONSTRAINT "signalement_id_ressource_fkey" FOREIGN KEY ("id_ressource") REFERENCES "ressource"("id_ressource") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalement" ADD CONSTRAINT "signalement_id_commentaire_fkey" FOREIGN KEY ("id_commentaire") REFERENCES "commentaire"("id_commentaire") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalement" ADD CONSTRAINT "signalement_id_moderateur_fkey" FOREIGN KEY ("id_moderateur") REFERENCES "utilisateur"("id_utilisateur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ami" ADD CONSTRAINT "ami_id_utilisateur1_fkey" FOREIGN KEY ("id_utilisateur1") REFERENCES "utilisateur"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ami" ADD CONSTRAINT "ami_id_utilisateur2_fkey" FOREIGN KEY ("id_utilisateur2") REFERENCES "utilisateur"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- Optional consistency rule for reports
ALTER TABLE "signalement"
ADD CONSTRAINT "signalement_cible_check"
CHECK (
  ("type_signalement" = 'ressource' AND "id_ressource" IS NOT NULL AND "id_commentaire" IS NULL)
  OR
  ("type_signalement" = 'commentaire' AND "id_commentaire" IS NOT NULL AND "id_ressource" IS NULL)
);
