import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { FavorisService } from './favoris.service';

@Controller('favoris')
export class FavorisController {
  constructor(private readonly favorisService: FavorisService) {}

  @Get('utilisateur/:id')
  findByUtilisateur(@Param('id', ParseIntPipe) id: number) {
    return this.favorisService.findByUtilisateur(id);
  }

  @Get(':userId/:ressourceId')
  isFavori(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('ressourceId', ParseIntPipe) ressourceId: number,
  ) {
    return this.favorisService.isFavori(userId, ressourceId);
  }

  @Post(':userId/:ressourceId')
  add(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('ressourceId', ParseIntPipe) ressourceId: number,
  ) {
    return this.favorisService.add(userId, ressourceId);
  }

  @Delete(':userId/:ressourceId')
  remove(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('ressourceId', ParseIntPipe) ressourceId: number,
  ) {
    return this.favorisService.remove(userId, ressourceId);
  }
}
