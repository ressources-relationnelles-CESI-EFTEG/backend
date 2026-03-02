import { Controller } from '@nestjs/common';
import { CommentairesService } from './commentaires.service';

@Controller('commentaires')
export class CommentairesController {
  constructor(private readonly commentairesService: CommentairesService) {}
}
