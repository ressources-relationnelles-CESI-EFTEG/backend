import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateCommentaireDto {
  @IsOptional()
  @IsString()
  contenu?: string;

  @IsOptional()
  @IsEnum(['VISIBLE', 'MASQUE', 'SUPPRIME'])
  statut?: string;
}
