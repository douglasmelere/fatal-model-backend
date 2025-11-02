"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const entities_1 = require("../../database/entities");
let MessagesService = class MessagesService {
    conversationsRepository;
    messagesRepository;
    appointmentsRepository;
    usersRepository;
    constructor(conversationsRepository, messagesRepository, appointmentsRepository, usersRepository) {
        this.conversationsRepository = conversationsRepository;
        this.messagesRepository = messagesRepository;
        this.appointmentsRepository = appointmentsRepository;
        this.usersRepository = usersRepository;
    }
    async getOrCreateConversation(userId, bookingId) {
        const booking = await this.appointmentsRepository.findOne({
            where: { id: bookingId },
            relations: ['client', 'escort'],
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (booking.client_id !== userId && booking.escort_id !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to access this conversation');
        }
        let conversation = await this.conversationsRepository.findOne({
            where: { booking_id: bookingId },
            relations: ['client', 'escort', 'booking'],
        });
        if (!conversation) {
            conversation = this.conversationsRepository.create({
                client_id: booking.client_id,
                escort_id: booking.escort_id,
                booking_id: bookingId,
                is_active: true,
            });
            conversation = await this.conversationsRepository.save(conversation);
            const loadedConversation = await this.conversationsRepository.findOne({
                where: { id: conversation.id },
                relations: ['client', 'escort', 'booking'],
            });
            if (!loadedConversation) {
                throw new common_1.NotFoundException('Conversation not found after creation');
            }
            conversation = loadedConversation;
        }
        return conversation;
    }
    async createConversation(userId, createConversationDto) {
        return this.getOrCreateConversation(userId, createConversationDto.booking_id);
    }
    async sendMessage(userId, sendMessageDto) {
        const { conversation_id, content, message_type, metadata } = sendMessageDto;
        const conversation = await this.conversationsRepository.findOne({
            where: { id: conversation_id },
            relations: ['client', 'escort'],
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        if (conversation.client_id !== userId &&
            conversation.escort_id !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to send messages in this conversation');
        }
        if (!conversation.is_active) {
            throw new common_1.BadRequestException('This conversation is no longer active');
        }
        const message = this.messagesRepository.create({
            conversation_id,
            sender_id: userId,
            content,
            message_type: message_type || entities_1.MessageType.TEXT,
            metadata: metadata || {},
            is_read: false,
        });
        const savedMessage = await this.messagesRepository.save(message);
        await this.conversationsRepository.update(conversation_id, {
            last_message_at: new Date(),
        });
        const messageWithRelations = await this.messagesRepository.findOne({
            where: { id: savedMessage.id },
            relations: ['sender', 'conversation'],
        });
        if (!messageWithRelations) {
            throw new common_1.NotFoundException('Message not found after creation');
        }
        return messageWithRelations;
    }
    async getMessages(userId, conversationId, limit = 50, offset = 0) {
        const conversation = await this.conversationsRepository.findOne({
            where: { id: conversationId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        if (conversation.client_id !== userId &&
            conversation.escort_id !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to view this conversation');
        }
        const [messages, total] = await this.messagesRepository.findAndCount({
            where: { conversation_id: conversationId },
            relations: ['sender'],
            order: { created_at: 'DESC' },
            take: limit,
            skip: offset,
        });
        return { messages: messages.reverse(), total };
    }
    async getUserConversations(userId, limit = 20, offset = 0) {
        const [conversations, total] = await this.conversationsRepository.findAndCount({
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
    async getConversation(userId, conversationId) {
        const conversation = await this.conversationsRepository.findOne({
            where: { id: conversationId },
            relations: ['client', 'escort', 'booking', 'messages'],
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        if (conversation.client_id !== userId &&
            conversation.escort_id !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to view this conversation');
        }
        return conversation;
    }
    async getConversationByBooking(userId, bookingId) {
        return this.getOrCreateConversation(userId, bookingId);
    }
    async markMessagesAsRead(userId, markReadDto) {
        const { conversation_id, message_ids } = markReadDto;
        const conversation = await this.conversationsRepository.findOne({
            where: { id: conversation_id },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        if (conversation.client_id !== userId &&
            conversation.escort_id !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to mark messages in this conversation');
        }
        const queryBuilder = this.messagesRepository
            .createQueryBuilder()
            .update(entities_1.MessageEntity)
            .set({
            is_read: true,
            read_at: new Date(),
        })
            .where('conversation_id = :conversation_id', { conversation_id })
            .andWhere('sender_id != :userId', { userId })
            .andWhere('is_read = false');
        if (message_ids && message_ids.length > 0) {
            queryBuilder.andWhere('id IN (:...message_ids)', { message_ids });
        }
        const result = await queryBuilder.execute();
        return { updated: result.affected || 0 };
    }
    async getUnreadCount(userId) {
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
    async getUnreadCountByConversation(userId, conversationId) {
        const conversation = await this.conversationsRepository.findOne({
            where: { id: conversationId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        if (conversation.client_id !== userId &&
            conversation.escort_id !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to view this conversation');
        }
        const count = await this.messagesRepository.count({
            where: {
                conversation_id: conversationId,
                sender_id: (0, typeorm_1.Not)(userId),
                is_read: false,
            },
        });
        return count;
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(entities_1.ConversationEntity)),
    __param(1, (0, typeorm_2.InjectRepository)(entities_1.MessageEntity)),
    __param(2, (0, typeorm_2.InjectRepository)(entities_1.AppointmentEntity)),
    __param(3, (0, typeorm_2.InjectRepository)(entities_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository])
], MessagesService);
//# sourceMappingURL=messages.service.js.map