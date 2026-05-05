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
import { Roles } from '../auth/roles.decorator';

@Controller('signalements')
export class SignalementsController {
  constructor(private readonly signalementsService: SignalementsService) {}

  @Roles('MODERATEUR', 'ADMINISTRATEUR', 'SUPER_ADMIN')
  @Get()
  findAll(@Query('statut') statut?: string) {
    return this.signalementsService.findAll(statut);
  }

  @Roles('MODERATEUR', 'ADMINISTRATEUR', 'SUPER_ADMIN')
  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.signalementsService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateSignalementDto) {
    return this.signalementsService.create(dto);
  }

  @Roles('MODERATEUR', 'ADMINISTRATEUR', 'SUPER_ADMIN')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSignalementDto,
  ) {
    return this.signalementsService.update(id, dto);
  }

  @Roles('ADMINISTRATEUR', 'SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.signalementsService.remove(id);
  }
}
