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
import { SignalementsService } from './signalements.service';
import { CreateSignalementDto } from './dto/create-signalement.dto';
import { UpdateSignalementDto } from './dto/update-signalement.dto';

@Controller('signalements')
export class SignalementsController {
  constructor(private readonly signalementsService: SignalementsService) {}

  @Get()
  findAll(@Query('statut') statut?: string) {
    return this.signalementsService.findAll(statut);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.signalementsService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateSignalementDto) {
    return this.signalementsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSignalementDto,
  ) {
    return this.signalementsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.signalementsService.remove(id);
  }
}
