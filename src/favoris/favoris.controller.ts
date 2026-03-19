import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { FavorisService } from './favoris.service';

@Controller('favoris')
export class FavorisController {
  constructor(private readonly favorisService: FavorisService) {}

  @Get('utilisateur/:id')
  findByUtilisateur(@Param('id', ParseIntPipe) id: number) {
    return this.favorisService.findByUtilisateur(id);
  }
}
