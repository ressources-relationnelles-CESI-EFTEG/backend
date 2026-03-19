import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentaireDto {
  @IsInt()
  idUtilisateur: number;

  @IsInt()
  idRessource: number;

  @IsOptional()
  @IsInt()
  idCommentaireParent?: number;

  @IsString()
  @IsNotEmpty()
  contenu: string;
}
