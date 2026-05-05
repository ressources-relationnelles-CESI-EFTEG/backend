import { ArrayMinSize, IsArray, IsInt } from 'class-validator';

export class CreateConversationDto {
  @IsArray()
  @ArrayMinSize(2)
  @IsInt({ each: true })
  participantIds: number[];
}
