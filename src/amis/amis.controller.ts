import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AmisService } from './amis.service';

@ApiTags('Amis')
@ApiBearerAuth('bearer')
@Controller('amis')
export class AmisController {
  constructor(private readonly amisService: AmisService) {}

  @ApiOperation({ summary: 'Lister les amis d\'un utilisateur' })
  @Get('utilisateur/:id')
  findByUtilisateur(@Param('id', ParseIntPipe) id: number) {
    return this.amisService.findByUtilisateur(id);
  }

  @ApiOperation({ summary: 'Lister les demandes d\'amis reçues' })
  @Get('demandes/recues/:id')
  findDemandesRecues(@Param('id', ParseIntPipe) id: number) {
    return this.amisService.findDemandesRecues(id);
  }

  @ApiOperation({ summary: 'Lister les demandes d\'amis envoyées' })
  @Get('demandes/envoyees/:id')
  findDemandesEnvoyees(@Param('id', ParseIntPipe) id: number) {
    return this.amisService.findDemandesEnvoyees(id);
  }

  @ApiOperation({ summary: 'Envoyer une demande d\'ami' })
  @Post(':userId1/:userId2')
  envoyer(
    @Param('userId1', ParseIntPipe) userId1: number,
    @Param('userId2', ParseIntPipe) userId2: number,
  ) {
    return this.amisService.envoyer(userId1, userId2);
  }

  @ApiOperation({ summary: 'Accepter une demande d\'ami' })
  @Patch('accepter/:userId1/:userId2')
  accepter(
    @Param('userId1', ParseIntPipe) userId1: number,
    @Param('userId2', ParseIntPipe) userId2: number,
  ) {
    return this.amisService.accepter(userId1, userId2);
  }

  @ApiOperation({ summary: 'Refuser une demande d\'ami' })
  @Patch('refuser/:userId1/:userId2')
  refuser(
    @Param('userId1', ParseIntPipe) userId1: number,
    @Param('userId2', ParseIntPipe) userId2: number,
  ) {
    return this.amisService.refuser(userId1, userId2);
  }

  @ApiOperation({ summary: 'Supprimer un ami' })
  @Delete(':userId1/:userId2')
  supprimer(
    @Param('userId1', ParseIntPipe) userId1: number,
    @Param('userId2', ParseIntPipe) userId2: number,
  ) {
    return this.amisService.supprimer(userId1, userId2);
  }
}
