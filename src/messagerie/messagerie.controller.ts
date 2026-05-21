import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MessagerieService } from './messagerie.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

type AuthRequest = { user: { userId: number; email: string } };

@ApiTags('Messagerie')
@ApiBearerAuth('bearer')
@Controller('messagerie')
export class MessagerieController {
  constructor(private readonly messagerieService: MessagerieService) {}

  @ApiOperation({ summary: "Lister les conversations d'un utilisateur" })
  @Get('conversations/utilisateur/:id')
  findConversations(@Param('id', ParseIntPipe) id: number) {
    return this.messagerieService.findConversationsByUtilisateur(id);
  }

  @ApiOperation({ summary: 'Récupérer une conversation par son identifiant' })
  @Get('conversations/:id')
  findConversation(@Param('id', ParseIntPipe) id: number) {
    return this.messagerieService.findConversationById(id);
  }

  @ApiOperation({ summary: "Lister les messages d'une conversation" })
  @Get('conversations/:id/messages')
  findMessages(@Param('id', ParseIntPipe) id: number) {
    return this.messagerieService.findMessages(id);
  }

  @ApiOperation({ summary: "Compter les messages non lus d'un utilisateur" })
  @Get('non-lus/:id')
  countUnread(@Param('id', ParseIntPipe) id: number) {
    return this.messagerieService.countUnread(id);
  }

  @ApiOperation({ summary: 'Créer une nouvelle conversation' })
  @Post('conversations')
  createConversation(@Body() dto: CreateConversationDto) {
    return this.messagerieService.createConversation(dto);
  }

  @ApiOperation({ summary: 'Envoyer un message dans une conversation' })
  @Post('conversations/:id/messages')
  sendMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SendMessageDto,
    @Req() req: AuthRequest,
  ) {
    return this.messagerieService.sendMessage(id, dto, req.user.userId);
  }

  @ApiOperation({
    summary: "Marquer les messages d'une conversation comme lus",
  })
  @Patch('conversations/:id/lu/:userId')
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.messagerieService.markAsRead(id, userId);
  }

  @ApiOperation({ summary: 'Quitter une conversation' })
  @Delete('conversations/:id')
  leaveConversation(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    return this.messagerieService.leaveConversation(id, req.user.userId);
  }

  @ApiOperation({
    summary: 'Quitter une conversation (alias /participants/me)',
  })
  @Delete('conversations/:id/participants/me')
  leaveConversationAlias(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    return this.messagerieService.leaveConversation(id, req.user.userId);
  }

  @ApiOperation({ summary: 'Supprimer un message' })
  @Delete('messages/:idMessage')
  deleteMessage(
    @Param('idMessage', ParseIntPipe) idMessage: number,
    @Req() req: AuthRequest,
  ) {
    return this.messagerieService.deleteMessage(idMessage, req.user.userId);
  }
}
