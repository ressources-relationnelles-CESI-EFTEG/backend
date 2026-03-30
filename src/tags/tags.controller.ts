import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { Roles } from '../auth/roles.decorator';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  findAll() {
    return this.tagsService.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.findById(id);
  }

  @Roles('ADMINISTRATEUR', 'SUPER_ADMIN')
  @Post()
  create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto);
  }

  @Roles('ADMINISTRATEUR', 'SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.remove(id);
  }

  @Roles('ADMINISTRATEUR', 'SUPER_ADMIN')
  @Post('ressource/:ressourceId/:tagId')
  addToRessource(
    @Param('ressourceId', ParseIntPipe) ressourceId: number,
    @Param('tagId', ParseIntPipe) tagId: number,
  ) {
    return this.tagsService.addToRessource(ressourceId, tagId);
  }

  @Roles('ADMINISTRATEUR', 'SUPER_ADMIN')
  @Delete('ressource/:ressourceId/:tagId')
  removeFromRessource(
    @Param('ressourceId', ParseIntPipe) ressourceId: number,
    @Param('tagId', ParseIntPipe) tagId: number,
  ) {
    return this.tagsService.removeFromRessource(ressourceId, tagId);
  }
}
