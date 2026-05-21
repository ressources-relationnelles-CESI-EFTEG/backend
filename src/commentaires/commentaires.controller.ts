import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommentairesService } from './commentaires.service';
import { CreateCommentaireDto } from './dto/create-commentaire.dto';
import { UpdateCommentaireDto } from './dto/update-commentaire.dto';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Commentaires')
@ApiBearerAuth('bearer')
@Controller('commentaires')
export class CommentairesController {
  constructor(private readonly commentairesService: CommentairesService) {}

  @ApiOperation({ summary: 'Lister les commentaires d\'une ressource' })
  @Get('ressource/:id')
  findByRessource(@Param('id', ParseIntPipe) id: number) {
    return this.commentairesService.findByRessource(id);
  }

  @ApiOperation({ summary: 'Récupérer un commentaire par son identifiant' })
  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.commentairesService.findById(id);
  }

  @ApiOperation({ summary: 'Créer un commentaire sur une ressource' })
  @Post()
  create(@Body() dto: CreateCommentaireDto) {
    return this.commentairesService.create(dto);
  }

  @Roles('MODERATEUR', 'ADMINISTRATEUR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Mettre à jour un commentaire (modérateur)' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommentaireDto,
  ) {
    return this.commentairesService.update(id, dto);
  }

  @Roles('MODERATEUR', 'ADMINISTRATEUR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Supprimer un commentaire (modérateur)' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.commentairesService.remove(id);
  }
}
