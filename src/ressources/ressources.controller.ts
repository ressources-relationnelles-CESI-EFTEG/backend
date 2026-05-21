import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RessourcesService } from './ressources.service';
import { CreateRessourceDto } from './dto/create-ressource.dto';
import { UpdateRessourceDto } from './dto/update-ressource.dto';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Ressources')
@ApiBearerAuth('bearer')
@Controller('ressources')
export class RessourcesController {
  constructor(private readonly ressourcesService: RessourcesService) {}

  @Roles('MODERATEUR', 'ADMINISTRATEUR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Lister les ressources en attente de modération' })
  @Get('moderation')
  findForModeration() {
    return this.ressourcesService.findForModeration();
  }

  @ApiOperation({ summary: 'Lister toutes les ressources publiées' })
  @Get()
  findAll(@Query('categorie') categorie?: string) {
    const categorieId = categorie ? parseInt(categorie, 10) : undefined;
    return this.ressourcesService.findAll(
      categorieId && !isNaN(categorieId) ? categorieId : undefined,
    );
  }

  @ApiOperation({ summary: 'Récupérer une ressource par son identifiant' })
  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.ressourcesService.findById(id);
  }

  @ApiOperation({ summary: 'Lister les ressources d\'un utilisateur' })
  @Get('utilisateur/:id')
  findByUtilisateur(@Param('id', ParseIntPipe) id: number) {
    return this.ressourcesService.findByUtilisateur(id);
  }

  @ApiOperation({ summary: 'Créer une nouvelle ressource' })
  @Post()
  create(@Body() dto: CreateRessourceDto) {
    return this.ressourcesService.create(dto);
  }

  @Roles('MODERATEUR', 'ADMINISTRATEUR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Mettre à jour une ressource (modérateur)' })
  @Patch(':id')
  update(
    @Req() req: { user: { userId: number; email: string } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRessourceDto,
  ) {
    return this.ressourcesService.update(id, dto, req.user.userId);
  }

  @Roles('MODERATEUR', 'ADMINISTRATEUR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Supprimer une ressource (modérateur)' })
  @Delete(':id')
  remove(
    @Req() req: { user: { userId: number; email: string } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ressourcesService.remove(id, req.user.userId);
  }
}
