import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { AmisService } from './amis.service';

@Controller('amis')
export class AmisController {
  constructor(private readonly amisService: AmisService) {}

  @Get('utilisateur/:id')
  findByUtilisateur(@Param('id', ParseIntPipe) id: number) {
    return this.amisService.findByUtilisateur(id);
  }

  @Get('demandes/recues/:id')
  findDemandesRecues(@Param('id', ParseIntPipe) id: number) {
    return this.amisService.findDemandesRecues(id);
  }

  @Get('demandes/envoyees/:id')
  findDemandesEnvoyees(@Param('id', ParseIntPipe) id: number) {
    return this.amisService.findDemandesEnvoyees(id);
  }

  @Post(':userId1/:userId2')
  envoyer(
    @Param('userId1', ParseIntPipe) userId1: number,
    @Param('userId2', ParseIntPipe) userId2: number,
  ) {
    return this.amisService.envoyer(userId1, userId2);
  }

  @Patch('accepter/:userId1/:userId2')
  accepter(
    @Param('userId1', ParseIntPipe) userId1: number,
    @Param('userId2', ParseIntPipe) userId2: number,
  ) {
    return this.amisService.accepter(userId1, userId2);
  }

  @Patch('refuser/:userId1/:userId2')
  refuser(
    @Param('userId1', ParseIntPipe) userId1: number,
    @Param('userId2', ParseIntPipe) userId2: number,
  ) {
    return this.amisService.refuser(userId1, userId2);
  }

  @Delete(':userId1/:userId2')
  supprimer(
    @Param('userId1', ParseIntPipe) userId1: number,
    @Param('userId2', ParseIntPipe) userId2: number,
  ) {
    return this.amisService.supprimer(userId1, userId2);
  }
}
