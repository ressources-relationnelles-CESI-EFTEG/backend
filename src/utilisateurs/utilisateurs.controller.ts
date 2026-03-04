import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { UtilisateursService } from './utilisateurs.service';
import { UpdateUtilisateurDto } from './dto/update-utilisateur.dto';

@Controller('utilisateurs')
export class UtilisateursController {
  constructor(private readonly utilisateursService: UtilisateursService) {}

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.utilisateursService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUtilisateurDto,
  ) {
    return this.utilisateursService.update(id, dto);
  }
}
