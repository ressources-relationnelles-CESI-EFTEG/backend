import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCategorieDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nom?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  parentId?: number | null;
}
