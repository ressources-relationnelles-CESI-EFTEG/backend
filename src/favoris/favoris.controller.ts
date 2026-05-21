import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FavorisService } from './favoris.service';

@ApiTags('Favoris')
@ApiBearerAuth('bearer')
@Controller('favoris')
export class FavorisController {
  constructor(private readonly favorisService: FavorisService) {}

  @ApiOperation({ summary: "Lister les favoris d'un utilisateur" })
  @Get('utilisateur/:id')
  findByUtilisateur(@Param('id', ParseIntPipe) id: number) {
    return this.favorisService.findByUtilisateur(id);
  }

  @ApiOperation({ summary: 'Vérifier si une ressource est en favori' })
  @Get(':userId/:ressourceId')
  isFavori(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('ressourceId', ParseIntPipe) ressourceId: number,
  ) {
    return this.favorisService.isFavori(userId, ressourceId);
  }

  @ApiOperation({ summary: 'Ajouter une ressource aux favoris' })
  @Post(':userId/:ressourceId')
  add(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('ressourceId', ParseIntPipe) ressourceId: number,
  ) {
    return this.favorisService.add(userId, ressourceId);
  }

  @ApiOperation({ summary: 'Retirer une ressource des favoris' })
  @Delete(':userId/:ressourceId')
  remove(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('ressourceId', ParseIntPipe) ressourceId: number,
  ) {
    return this.favorisService.remove(userId, ressourceId);
  }
}
