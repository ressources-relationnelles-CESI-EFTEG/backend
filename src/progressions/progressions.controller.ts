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
import { ProgressionsService } from './progressions.service';
import { CreateProgressionDto } from './dto/create-progression.dto';
import { UpdateProgressionDto } from './dto/update-progression.dto';

@Controller('progressions')
export class ProgressionsController {
  constructor(private readonly progressionsService: ProgressionsService) {}

  @Get('utilisateur/:id')
  findByUtilisateur(
    @Param('id', ParseIntPipe) id: number,
    @Query('type') type?: string,
  ) {
    return this.progressionsService.findByUtilisateur(id, type);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.progressionsService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateProgressionDto) {
    return this.progressionsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProgressionDto,
  ) {
    return this.progressionsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.progressionsService.remove(id);
  }
}
