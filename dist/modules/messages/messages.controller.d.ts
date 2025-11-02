import { MessagesService } from './messages.service';
import { SendMessageDto, CreateConversationDto, MarkMessagesReadDto } from './dto';
import { UserEntity } from '../../database/entities';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    createConversation(user: UserEntity, createConversationDto: CreateConversationDto): Promise<import("../../database/entities").ConversationEntity>;
    getConversationByBooking(user: UserEntity, bookingId: string): Promise<import("../../database/entities").ConversationEntity>;
    getUserConversations(user: UserEntity, limit: number, offset: number): Promise<{
        conversations: import("../../database/entities").ConversationEntity[];
        total: number;
    }>;
    getConversation(user: UserEntity, conversationId: string): Promise<import("../../database/entities").ConversationEntity>;
    sendMessage(user: UserEntity, sendMessageDto: SendMessageDto): Promise<import("../../database/entities").MessageEntity>;
    getMessages(user: UserEntity, conversationId: string, limit: number, offset: number): Promise<{
        messages: import("../../database/entities").MessageEntity[];
        total: number;
    }>;
    markMessagesAsRead(user: UserEntity, markReadDto: MarkMessagesReadDto): Promise<{
        updated: number;
    }>;
    getUnreadCount(user: UserEntity): Promise<{
        unread_count: number;
    }>;
    getUnreadCountByConversation(user: UserEntity, conversationId: string): Promise<{
        unread_count: number;
    }>;
}
