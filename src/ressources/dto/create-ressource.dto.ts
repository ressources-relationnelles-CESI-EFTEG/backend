import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateRessourceDto {
  @IsInt()
  idUtilisateur: number;

  @IsInt()
  idCategorie: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titre: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  contenu: string;

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
}
