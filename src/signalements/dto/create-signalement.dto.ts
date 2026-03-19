import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSignalementDto {
  @IsInt()
  idUtilisateur: number;

  @IsEnum(['RESSOURCE', 'COMMENTAIRE'])
  typeSignalement: string;

  @IsOptional()
  @IsInt()
  idRessource?: number;

  @IsOptional()
  @IsInt()
  idCommentaire?: number;

  @IsString()
  @IsNotEmpty()
  motif: string;
}
