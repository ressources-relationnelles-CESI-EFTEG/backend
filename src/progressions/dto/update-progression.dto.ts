import { IsEnum, IsInt, IsOptional } from 'class-validator';

export class UpdateProgressionDto {
  @IsOptional()
  @IsEnum(['EXPLOITEE', 'MISE_DE_COTE'])
  typeProgression?: string;

  @IsOptional()
  @IsInt()
  rappelJours?: number | null;
}
