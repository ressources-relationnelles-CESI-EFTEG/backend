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

  @Post()
  create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.remove(id);
  }

  @Post('ressource/:ressourceId/:tagId')
  addToRessource(
    @Param('ressourceId', ParseIntPipe) ressourceId: number,
    @Param('tagId', ParseIntPipe) tagId: number,
  ) {
    return this.tagsService.addToRessource(ressourceId, tagId);
  }

  @Delete('ressource/:ressourceId/:tagId')
  removeFromRessource(
    @Param('ressourceId', ParseIntPipe) ressourceId: number,
    @Param('tagId', ParseIntPipe) tagId: number,
  ) {
    return this.tagsService.removeFromRessource(ressourceId, tagId);
  }
}
