import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateSignalementDto {
  @IsOptional()
  @IsEnum(['EN_ATTENTE', 'TRAITE', 'IGNORE'])
  statut?: string;

  @IsOptional()
  @IsInt()
  idModerateur?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  actionPrise?: string;
}
