import { Controller } from '@nestjs/common';
import { FavorisService } from './favoris.service';

@Controller('favoris')
export class FavorisController {
  constructor(private readonly favorisService: FavorisService) {}
}
