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
import { RessourcesService } from './ressources.service';
import { CreateRessourceDto } from './dto/create-ressource.dto';
import { UpdateRessourceDto } from './dto/update-ressource.dto';
import { Roles } from '../auth/roles.decorator';

@Controller('ressources')
export class RessourcesController {
  constructor(private readonly ressourcesService: RessourcesService) {}

  @Roles('MODERATEUR', 'ADMINISTRATEUR', 'SUPER_ADMIN')
  @Get('moderation')
  findForModeration() {
    return this.ressourcesService.findForModeration();
  }

  @Get()
  findAll(@Query('categorie') categorie?: string) {
    const categorieId = categorie ? parseInt(categorie, 10) : undefined;
    return this.ressourcesService.findAll(
      categorieId && !isNaN(categorieId) ? categorieId : undefined,
    );
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.ressourcesService.findById(id);
  }

  @Get('utilisateur/:id')
  findByUtilisateur(@Param('id', ParseIntPipe) id: number) {
    return this.ressourcesService.findByUtilisateur(id);
  }

  @Post()
  create(@Body() dto: CreateRessourceDto) {
    return this.ressourcesService.create(dto);
  }

  @Roles('MODERATEUR', 'ADMINISTRATEUR', 'SUPER_ADMIN')
  @Patch(':id')
  update(
    @Req() req: { user: { userId: number; email: string } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRessourceDto,
  ) {
    return this.ressourcesService.update(id, dto, req.user.userId);
  }

  @Roles('MODERATEUR', 'ADMINISTRATEUR', 'SUPER_ADMIN')
  @Delete(':id')
  remove(
    @Req() req: { user: { userId: number; email: string } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ressourcesService.remove(id, req.user.userId);
  }
}
