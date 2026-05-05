import { IsEnum, IsInt, IsOptional } from 'class-validator';

export class CreateProgressionDto {
  @IsInt()
  idUtilisateur: number;

  @IsInt()
  idRessource: number;

  @IsEnum(['EXPLOITEE', 'MISE_DE_COTE'])
  typeProgression: string;

  @IsOptional()
  @IsInt()
  rappelJours?: number;
}
