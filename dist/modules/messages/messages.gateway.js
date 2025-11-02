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
exports.MessagesGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const messages_service_1 = require("./messages.service");
const dto_1 = require("./dto");
let MessagesGateway = class MessagesGateway {
    jwtService;
    messagesService;
    server;
    logger = new common_1.Logger('MessagesGateway');
    userSockets = new Map();
    socketUsers = new Map();
    constructor(jwtService, messagesService) {
        this.jwtService = jwtService;
        this.messagesService = messagesService;
    }
    afterInit(server) {
        this.logger.log('Messages WebSocket server initialized');
    }
    handleConnection(client) {
        const token = client.handshake.auth?.token ||
            client.handshake.headers?.authorization?.replace('Bearer ', '') ||
            client.handshake.query?.token;
        this.logger.debug('Connection attempt:', {
            hasAuthToken: !!client.handshake.auth?.token,
            hasHeaderAuth: !!client.handshake.headers?.authorization,
            hasQueryToken: !!client.handshake.query?.token,
            tokenLength: token?.length || 0,
        });
        if (!token) {
            this.logger.warn('Client connected without token - disconnecting');
            client.emit('error', { message: 'Authentication required' });
            client.disconnect();
            return;
        }
        try {
            const payload = this.jwtService.verify(token);
            const userId = payload.sub;
            if (!userId) {
                this.logger.warn('Token verified but no userId found in payload');
                client.emit('error', { message: 'Invalid token: missing user ID' });
                client.disconnect();
                return;
            }
            this.userSockets.set(userId, client.id);
            this.socketUsers.set(client.id, userId);
            client.join(`user_${userId}`);
            this.logger.log(`User ${userId} connected to messages with socket ${client.id}`);
            client.emit('connected', { userId, socketId: client.id });
        }
        catch (error) {
            this.logger.error('Invalid token:', {
                error: error.message,
                name: error.name,
                tokenPreview: token?.substring(0, 20) + '...',
            });
            client.emit('error', {
                message: 'Authentication failed',
                error: error.message
            });
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const userId = this.socketUsers.get(client.id);
        if (userId) {
            this.userSockets.delete(userId);
            this.socketUsers.delete(client.id);
            this.logger.log(`User ${userId} disconnected from messages`);
        }
    }
    async handleSendMessage(client, data) {
        const userId = this.socketUsers.get(client.id);
        if (!userId) {
            return { error: 'Unauthorized' };
        }
        try {
            const message = await this.messagesService.sendMessage(userId, data);
            const conversation = await this.messagesService.getConversation(userId, data.conversation_id);
            const recipientId = conversation.client_id === userId
                ? conversation.escort_id
                : conversation.client_id;
            this.server.to(`user_${userId}`).emit('message_sent', {
                message,
                conversation_id: data.conversation_id,
            });
            this.server.to(`user_${recipientId}`).emit('new_message', {
                message,
                conversation_id: data.conversation_id,
            });
            this.server.to(`user_${userId}`).emit('conversation_updated', {
                conversation_id: data.conversation_id,
            });
            this.server.to(`user_${recipientId}`).emit('conversation_updated', {
                conversation_id: data.conversation_id,
            });
            return { success: true, message };
        }
        catch (error) {
            this.logger.error('Error sending message:', error.message);
            return { error: error.message || 'Failed to send message' };
        }
    }
    async handleMarkRead(client, data) {
        const userId = this.socketUsers.get(client.id);
        if (!userId) {
            return { error: 'Unauthorized' };
        }
        try {
            const result = await this.messagesService.markMessagesAsRead(userId, {
                conversation_id: data.conversation_id,
                message_ids: data.message_ids,
            });
            const conversation = await this.messagesService.getConversation(userId, data.conversation_id);
            const recipientId = conversation.client_id === userId
                ? conversation.escort_id
                : conversation.client_id;
            this.server.to(`user_${recipientId}`).emit('messages_read', {
                conversation_id: data.conversation_id,
                read_by: userId,
            });
            return { success: true, updated: result.updated };
        }
        catch (error) {
            this.logger.error('Error marking messages as read:', error.message);
            return { error: error.message || 'Failed to mark messages as read' };
        }
    }
    async handleJoinConversation(client, data) {
        const userId = this.socketUsers.get(client.id);
        if (!userId) {
            return { error: 'Unauthorized' };
        }
        try {
            await this.messagesService.getConversation(userId, data.conversation_id);
            client.join(`conversation_${data.conversation_id}`);
            client.join(`user_${userId}`);
            return { success: true, conversation_id: data.conversation_id };
        }
        catch (error) {
            this.logger.error('Error joining conversation:', error.message);
            return { error: error.message || 'Failed to join conversation' };
        }
    }
    handleLeaveConversation(client, data) {
        client.leave(`conversation_${data.conversation_id}`);
        return { success: true, conversation_id: data.conversation_id };
    }
    emitToConversation(conversationId, event, data) {
        this.server.to(`conversation_${conversationId}`).emit(event, data);
    }
    emitToUser(userId, event, data) {
        this.server.to(`user_${userId}`).emit(event, data);
    }
};
exports.MessagesGateway = MessagesGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MessagesGateway.prototype, "server", void 0);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "handleConnection", null);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "handleDisconnect", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('mark_read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleMarkRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_conversation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleJoinConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_conversation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "handleLeaveConversation", null);
exports.MessagesGateway = MessagesGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/messages',
        cors: {
            origin: '*',
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        messages_service_1.MessagesService])
], MessagesGateway);
//# sourceMappingURL=messages.gateway.js.map