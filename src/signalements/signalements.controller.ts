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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SignalementsService } from './signalements.service';
import { CreateSignalementDto } from './dto/create-signalement.dto';
import { UpdateSignalementDto } from './dto/update-signalement.dto';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Signalements')
@ApiBearerAuth('bearer')
@Controller('signalements')
export class SignalementsController {
  constructor(private readonly signalementsService: SignalementsService) {}

  @Roles('MODERATEUR', 'ADMINISTRATEUR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Lister tous les signalements (modérateur)' })
  @Get()
  findAll(@Query('statut') statut?: string) {
    return this.signalementsService.findAll(statut);
  }

  @Roles('MODERATEUR', 'ADMINISTRATEUR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Récupérer un signalement par son identifiant (modérateur)' })
  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.signalementsService.findById(id);
  }

  @ApiOperation({ summary: 'Créer un signalement sur une ressource ou un commentaire' })
  @Post()
  create(@Body() dto: CreateSignalementDto) {
    return this.signalementsService.create(dto);
  }

  @Roles('MODERATEUR', 'ADMINISTRATEUR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'un signalement (modérateur)' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSignalementDto,
  ) {
    return this.signalementsService.update(id, dto);
  }

  @Roles('ADMINISTRATEUR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Supprimer un signalement (admin)' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.signalementsService.remove(id);
  }
}
