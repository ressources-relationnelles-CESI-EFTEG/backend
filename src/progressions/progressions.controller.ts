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
import { ProgressionsService } from './progressions.service';
import { CreateProgressionDto } from './dto/create-progression.dto';
import { UpdateProgressionDto } from './dto/update-progression.dto';

@ApiTags('Progressions')
@ApiBearerAuth('bearer')
@Controller('progressions')
export class ProgressionsController {
  constructor(private readonly progressionsService: ProgressionsService) {}

  @ApiOperation({ summary: 'Lister les progressions d\'un utilisateur' })
  @Get('utilisateur/:id')
  findByUtilisateur(
    @Param('id', ParseIntPipe) id: number,
    @Query('type') type?: string,
  ) {
    return this.progressionsService.findByUtilisateur(id, type);
  }

  @ApiOperation({ summary: 'Récupérer une progression par son identifiant' })
  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.progressionsService.findById(id);
  }

  @ApiOperation({ summary: 'Créer ou initialiser une progression' })
  @Post()
  create(@Body() dto: CreateProgressionDto) {
    return this.progressionsService.create(dto);
  }

  @ApiOperation({ summary: 'Mettre à jour une progression' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProgressionDto,
  ) {
    return this.progressionsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Supprimer une progression' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.progressionsService.remove(id);
  }
}
