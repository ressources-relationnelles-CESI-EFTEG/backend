-- Supprime le CHECK constraint cassé sur la table signalement.
-- La comparaison utilisait des valeurs en minuscule ('ressource', 'commentaire')
-- alors que l'enum PostgreSQL stocke en majuscule ('RESSOURCE', 'COMMENTAIRE').
-- Résultat : NULL AND FALSE = FALSE pour tout insert sans idRessource ET idCommentaire.
ALTER TABLE "signalement" DROP CONSTRAINT IF EXISTS "signalement_cible_check";
