import { Controller } from '@nestjs/common';
import { SignalementsService } from './signalements.service';

@Controller('signalements')
export class SignalementsController {
  constructor(private readonly signalementsService: SignalementsService) {}
}
