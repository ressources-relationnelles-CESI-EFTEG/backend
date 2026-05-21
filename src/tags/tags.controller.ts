import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Tags')
@ApiBearerAuth('bearer')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @ApiOperation({ summary: 'Lister tous les tags' })
  @Get()
  findAll() {
    return this.tagsService.findAll();
  }

  @ApiOperation({ summary: 'Récupérer un tag par son identifiant' })
  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.findById(id);
  }

  @Roles('ADMINISTRATEUR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Créer un nouveau tag (admin)' })
  @Post()
  create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto);
  }

  @Roles('ADMINISTRATEUR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Supprimer un tag (admin)' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.remove(id);
  }

  @Roles('ADMINISTRATEUR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Associer un tag à une ressource (admin)' })
  @Post('ressource/:ressourceId/:tagId')
  addToRessource(
    @Param('ressourceId', ParseIntPipe) ressourceId: number,
    @Param('tagId', ParseIntPipe) tagId: number,
  ) {
    return this.tagsService.addToRessource(ressourceId, tagId);
  }

  @Roles('ADMINISTRATEUR', 'SUPER_ADMIN')
  @ApiOperation({ summary: "Dissocier un tag d'une ressource (admin)" })
  @Delete('ressource/:ressourceId/:tagId')
  removeFromRessource(
    @Param('ressourceId', ParseIntPipe) ressourceId: number,
    @Param('tagId', ParseIntPipe) tagId: number,
  ) {
    return this.tagsService.removeFromRessource(ressourceId, tagId);
  }
}
