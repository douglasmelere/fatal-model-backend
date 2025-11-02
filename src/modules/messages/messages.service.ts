import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository, Not } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConversationEntity,
  MessageEntity,
  MessageType,
  AppointmentEntity,
  UserEntity,
} from '../../database/entities';
import {
  SendMessageDto,
  CreateConversationDto,
  MarkMessagesReadDto,
} from './dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(ConversationEntity)
    private conversationsRepository: Repository<ConversationEntity>,
    @InjectRepository(MessageEntity)
    private messagesRepository: Repository<MessageEntity>,
    @InjectRepository(AppointmentEntity)
    private appointmentsRepository: Repository<AppointmentEntity>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  /**
   * Cria ou retorna uma conversa existente para um booking
   */
  async getOrCreateConversation(
    userId: string,
    bookingId: string,
  ): Promise<ConversationEntity> {
    // Verificar se booking existe e usuário tem permissão
    const booking = await this.appointmentsRepository.findOne({
      where: { id: bookingId },
      relations: ['client', 'escort'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verificar se usuário é cliente ou acompanhante deste booking
    if (booking.client_id !== userId && booking.escort_id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this conversation',
      );
    }

    // Verificar se conversa já existe
    let conversation = await this.conversationsRepository.findOne({
      where: { booking_id: bookingId },
      relations: ['client', 'escort', 'booking'],
    });

    if (!conversation) {
      // Criar nova conversa
      conversation = this.conversationsRepository.create({
        client_id: booking.client_id,
        escort_id: booking.escort_id,
        booking_id: bookingId,
        is_active: true,
      });

      conversation = await this.conversationsRepository.save(conversation);

      // Carregar relações
      conversation = await this.conversationsRepository.findOne({
        where: { id: conversation.id },
        relations: ['client', 'escort', 'booking'],
      });
    }

    return conversation;
  }

  /**
   * Cria uma conversa manualmente (para casos especiais)
   */
  async createConversation(
    userId: string,
    createConversationDto: CreateConversationDto,
  ): Promise<ConversationEntity> {
    return this.getOrCreateConversation(userId, createConversationDto.booking_id);
  }

  /**
   * Envia uma mensagem em uma conversa
   */
  async sendMessage(
    userId: string,
    sendMessageDto: SendMessageDto,
  ): Promise<MessageEntity> {
    const { conversation_id, content, message_type, metadata } = sendMessageDto;

    // Verificar se conversa existe e usuário tem permissão
    const conversation = await this.conversationsRepository.findOne({
      where: { id: conversation_id },
      relations: ['client', 'escort'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Verificar se usuário é cliente ou acompanhante
    if (
      conversation.client_id !== userId &&
      conversation.escort_id !== userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to send messages in this conversation',
      );
    }

    // Verificar se conversa está ativa
    if (!conversation.is_active) {
      throw new BadRequestException('This conversation is no longer active');
    }

    // Criar mensagem
    const message = this.messagesRepository.create({
      conversation_id,
      sender_id: userId,
      content,
      message_type: message_type || MessageType.TEXT,
      metadata: metadata || {},
      is_read: false,
    });

    const savedMessage = await this.messagesRepository.save(message);

    // Atualizar last_message_at da conversa
    await this.conversationsRepository.update(conversation_id, {
      last_message_at: new Date(),
    });

    // Carregar relações para retornar
    return this.messagesRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender', 'conversation'],
    });
  }

  /**
   * Lista mensagens de uma conversa
   */
  async getMessages(
    userId: string,
    conversationId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ messages: MessageEntity[]; total: number }> {
    // Verificar se conversa existe e usuário tem permissão
    const conversation = await this.conversationsRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Verificar permissão
    if (
      conversation.client_id !== userId &&
      conversation.escort_id !== userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to view this conversation',
      );
    }

    // Buscar mensagens
    const [messages, total] = await this.messagesRepository.findAndCount({
      where: { conversation_id: conversationId },
      relations: ['sender'],
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { messages: messages.reverse(), total }; // Reverter para ordem cronológica
  }

  /**
   * Lista todas as conversas de um usuário
   */
  async getUserConversations(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<{ conversations: ConversationEntity[]; total: number }> {
    const [conversations, total] =
      await this.conversationsRepository.findAndCount({
        where: [
          { client_id: userId, is_active: true },
          { escort_id: userId, is_active: true },
        ],
        relations: ['client', 'escort', 'booking'],
        order: { last_message_at: 'DESC' },
        take: limit,
        skip: offset,
      });

    return { conversations, total };
  }

  /**
   * Obtém uma conversa específica
   */
  async getConversation(
    userId: string,
    conversationId: string,
  ): Promise<ConversationEntity> {
    const conversation = await this.conversationsRepository.findOne({
      where: { id: conversationId },
      relations: ['client', 'escort', 'booking', 'messages'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Verificar permissão
    if (
      conversation.client_id !== userId &&
      conversation.escort_id !== userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to view this conversation',
      );
    }

    return conversation;
  }

  /**
   * Obtém uma conversa por booking_id
   */
  async getConversationByBooking(
    userId: string,
    bookingId: string,
  ): Promise<ConversationEntity> {
    return this.getOrCreateConversation(userId, bookingId);
  }

  /**
   * Marca mensagens como lidas
   */
  async markMessagesAsRead(
    userId: string,
    markReadDto: MarkMessagesReadDto,
  ): Promise<{ updated: number }> {
    const { conversation_id, message_ids } = markReadDto;

    // Verificar se conversa existe e usuário tem permissão
    const conversation = await this.conversationsRepository.findOne({
      where: { id: conversation_id },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Verificar permissão (não pode marcar como lida se não for participante)
    if (
      conversation.client_id !== userId &&
      conversation.escort_id !== userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to mark messages in this conversation',
      );
    }

    // Construir query
    const queryBuilder = this.messagesRepository
      .createQueryBuilder()
      .update(MessageEntity)
      .set({
        is_read: true,
        read_at: new Date(),
      })
      .where('conversation_id = :conversation_id', { conversation_id })
      .andWhere('sender_id != :userId', { userId }) // Não marcar próprias mensagens
      .andWhere('is_read = false');

    // Se message_ids fornecidos, filtrar por IDs
    if (message_ids && message_ids.length > 0) {
      queryBuilder.andWhere('id IN (:...message_ids)', { message_ids });
    }

    const result = await queryBuilder.execute();

    return { updated: result.affected || 0 };
  }

  /**
   * Conta mensagens não lidas de um usuário
   */
  async getUnreadCount(userId: string): Promise<number> {
    // Buscar conversas do usuário
    const conversations = await this.conversationsRepository.find({
      where: [
        { client_id: userId, is_active: true },
        { escort_id: userId, is_active: true },
      ],
    });

    const conversationIds = conversations.map((c) => c.id);

    if (conversationIds.length === 0) {
      return 0;
    }

    // Contar mensagens não lidas (onde sender não é o usuário)
    const count = await this.messagesRepository
      .createQueryBuilder('message')
      .where('message.conversation_id IN (:...conversationIds)', {
        conversationIds,
      })
      .andWhere('message.sender_id != :userId', { userId })
      .andWhere('message.is_read = false')
      .getCount();

    return count;
  }

  /**
   * Conta mensagens não lidas por conversa
   */
  async getUnreadCountByConversation(
    userId: string,
    conversationId: string,
  ): Promise<number> {
    // Verificar permissão
    const conversation = await this.conversationsRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (
      conversation.client_id !== userId &&
      conversation.escort_id !== userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to view this conversation',
      );
    }

    const count = await this.messagesRepository.count({
      where: {
        conversation_id: conversationId,
        sender_id: Not(userId),
        is_read: false,
      },
    });

    return count;
  }
}

