import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import {
  SendMessageDto,
  CreateConversationDto,
  MarkMessagesReadDto,
} from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../../database/entities';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * Cria ou obtém uma conversa para um booking
   */
  @Post('conversations')
  async createConversation(
    @CurrentUser() user: UserEntity,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    return this.messagesService.createConversation(user.id, createConversationDto);
  }

  /**
   * Obtém uma conversa por booking_id
   */
  @Get('conversations/booking/:bookingId')
  async getConversationByBooking(
    @CurrentUser() user: UserEntity,
    @Param('bookingId') bookingId: string,
  ) {
    return this.messagesService.getConversationByBooking(user.id, bookingId);
  }

  /**
   * Lista todas as conversas do usuário
   */
  @Get('conversations')
  async getUserConversations(
    @CurrentUser() user: UserEntity,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.messagesService.getUserConversations(user.id, limit, offset);
  }

  /**
   * Obtém uma conversa específica
   */
  @Get('conversations/:conversationId')
  async getConversation(
    @CurrentUser() user: UserEntity,
    @Param('conversationId') conversationId: string,
  ) {
    return this.messagesService.getConversation(user.id, conversationId);
  }

  /**
   * Envia uma mensagem em uma conversa
   */
  @Post('send')
  async sendMessage(
    @CurrentUser() user: UserEntity,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(user.id, sendMessageDto);
  }

  /**
   * Lista mensagens de uma conversa
   */
  @Get('conversations/:conversationId/messages')
  async getMessages(
    @CurrentUser() user: UserEntity,
    @Param('conversationId') conversationId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.messagesService.getMessages(
      user.id,
      conversationId,
      limit,
      offset,
    );
  }

  /**
   * Marca mensagens como lidas
   */
  @Put('mark-read')
  async markMessagesAsRead(
    @CurrentUser() user: UserEntity,
    @Body() markReadDto: MarkMessagesReadDto,
  ) {
    return this.messagesService.markMessagesAsRead(user.id, markReadDto);
  }

  /**
   * Conta mensagens não lidas do usuário
   */
  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: UserEntity) {
    const count = await this.messagesService.getUnreadCount(user.id);
    return { unread_count: count };
  }

  /**
   * Conta mensagens não lidas de uma conversa
   */
  @Get('conversations/:conversationId/unread-count')
  async getUnreadCountByConversation(
    @CurrentUser() user: UserEntity,
    @Param('conversationId') conversationId: string,
  ) {
    const count = await this.messagesService.getUnreadCountByConversation(
      user.id,
      conversationId,
    );
    return { unread_count: count };
  }
}

