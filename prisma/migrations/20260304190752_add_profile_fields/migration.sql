-- AlterTable
ALTER TABLE "utilisateur" ADD COLUMN     "description" TEXT,
ADD COLUMN     "phrase_accroche" VARCHAR(255),
ADD COLUMN     "region" VARCHAR(100),
ADD COLUMN     "telephone" VARCHAR(20);
