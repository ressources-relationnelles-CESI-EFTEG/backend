import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
  @IsInt()
  idUtilisateur: number;

  @IsString()
  @IsNotEmpty()
  contenu: string;
}
