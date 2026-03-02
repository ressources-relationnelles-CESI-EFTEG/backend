import { Controller } from '@nestjs/common';
import { MessagerieService } from './messagerie.service';

@Controller('messagerie')
export class MessagerieController {
  constructor(private readonly messagerieService: MessagerieService) {}
}
