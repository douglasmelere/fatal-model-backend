import { Repository } from 'typeorm';
import { ConversationEntity, MessageEntity, AppointmentEntity, UserEntity } from '../../database/entities';
import { SendMessageDto, CreateConversationDto, MarkMessagesReadDto } from './dto';
export declare class MessagesService {
    private conversationsRepository;
    private messagesRepository;
    private appointmentsRepository;
    private usersRepository;
    constructor(conversationsRepository: Repository<ConversationEntity>, messagesRepository: Repository<MessageEntity>, appointmentsRepository: Repository<AppointmentEntity>, usersRepository: Repository<UserEntity>);
    getOrCreateConversation(userId: string, bookingId: string): Promise<ConversationEntity>;
    createConversation(userId: string, createConversationDto: CreateConversationDto): Promise<ConversationEntity>;
    sendMessage(userId: string, sendMessageDto: SendMessageDto): Promise<MessageEntity>;
    getMessages(userId: string, conversationId: string, limit?: number, offset?: number): Promise<{
        messages: MessageEntity[];
        total: number;
    }>;
    getUserConversations(userId: string, limit?: number, offset?: number): Promise<{
        conversations: ConversationEntity[];
        total: number;
    }>;
    getConversation(userId: string, conversationId: string): Promise<ConversationEntity>;
    getConversationByBooking(userId: string, bookingId: string): Promise<ConversationEntity>;
    markMessagesAsRead(userId: string, markReadDto: MarkMessagesReadDto): Promise<{
        updated: number;
    }>;
    getUnreadCount(userId: string): Promise<number>;
    getUnreadCountByConversation(userId: string, conversationId: string): Promise<number>;
}
