import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateRessourceDto {
  @IsOptional()
  @IsInt()
  idCategorie?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  titre?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  contenu?: string;

  @IsOptional()
  @IsEnum(['ARTICLE', 'VIDEO', 'AUDIO', 'EXERCICE', 'ACTIVITE', 'JEU'])
  typeRessource?: string;

  @IsOptional()
  @IsEnum(['FAMILLE', 'COUPLE', 'AMITIE', 'PROFESSIONNEL', 'COMMUNAUTAIRE'])
  typeRelation?: string;

  @IsOptional()
  @IsEnum(['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE'])
  niveauDifficulte?: string;

  @IsOptional()
  @IsEnum(['PRIVEE', 'PARTAGEE', 'PUBLIQUE'])
  visibilite?: string;

  @IsOptional()
  @IsEnum(['BROUILLON', 'EN_ATTENTE', 'VALIDEE', 'REJETEE'])
  statut?: string;

  @IsOptional()
  @IsString()
  motifRejet?: string;
}
