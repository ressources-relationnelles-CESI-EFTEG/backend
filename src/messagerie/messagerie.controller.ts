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
import { MessagerieService } from './messagerie.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

type AuthRequest = { user: { userId: number; email: string } };

@Controller('messagerie')
export class MessagerieController {
  constructor(private readonly messagerieService: MessagerieService) {}

  @Get('conversations/utilisateur/:id')
  findConversations(@Param('id', ParseIntPipe) id: number) {
    return this.messagerieService.findConversationsByUtilisateur(id);
  }

  @Get('conversations/:id')
  findConversation(@Param('id', ParseIntPipe) id: number) {
    return this.messagerieService.findConversationById(id);
  }

  @Get('conversations/:id/messages')
  findMessages(@Param('id', ParseIntPipe) id: number) {
    return this.messagerieService.findMessages(id);
  }

  @Get('non-lus/:id')
  countUnread(@Param('id', ParseIntPipe) id: number) {
    return this.messagerieService.countUnread(id);
  }

  @Post('conversations')
  createConversation(@Body() dto: CreateConversationDto) {
    return this.messagerieService.createConversation(dto);
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SendMessageDto,
    @Req() req: AuthRequest,
  ) {
    return this.messagerieService.sendMessage(id, dto, req.user.userId);
  }

  @Patch('conversations/:id/lu/:userId')
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.messagerieService.markAsRead(id, userId);
  }

  @Delete('conversations/:id')
  leaveConversation(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    return this.messagerieService.leaveConversation(id, req.user.userId);
  }

  @Delete('conversations/:id/participants/me')
  leaveConversationAlias(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    return this.messagerieService.leaveConversation(id, req.user.userId);
  }

  @Delete('messages/:idMessage')
  deleteMessage(
    @Param('idMessage', ParseIntPipe) idMessage: number,
    @Req() req: AuthRequest,
  ) {
    return this.messagerieService.deleteMessage(idMessage, req.user.userId);
  }
}
