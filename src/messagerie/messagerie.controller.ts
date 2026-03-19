import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { MessagerieService } from './messagerie.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

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
  ) {
    return this.messagerieService.sendMessage(id, dto);
  }

  @Patch('conversations/:id/lu/:userId')
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.messagerieService.markAsRead(id, userId);
  }
}
