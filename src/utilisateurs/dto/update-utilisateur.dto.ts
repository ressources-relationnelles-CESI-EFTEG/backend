import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUtilisateurDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  prenom?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nom?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telephone?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  phraseAccroche?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string;
}
