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
import { CategoriesService } from './categories.service';
import { CreateCategorieDto } from './dto/create-categorie.dto';
import { UpdateCategorieDto } from './dto/update-categorie.dto';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Categories')
@ApiBearerAuth('bearer')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Lister toutes les catégories' })
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @ApiOperation({ summary: 'Récupérer une catégorie par son identifiant' })
  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findById(id);
  }

  @Roles('ADMINISTRATEUR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Créer une nouvelle catégorie (admin)' })
  @Post()
  create(@Body() dto: CreateCategorieDto) {
    return this.categoriesService.create(dto);
  }

  @Roles('ADMINISTRATEUR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Mettre à jour une catégorie (admin)' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategorieDto,
  ) {
    return this.categoriesService.update(id, dto);
  }

  @Roles('ADMINISTRATEUR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Supprimer une catégorie (admin)' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
