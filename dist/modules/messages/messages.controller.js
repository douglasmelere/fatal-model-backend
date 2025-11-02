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
exports.MessagesController = void 0;
const common_1 = require("@nestjs/common");
const messages_service_1 = require("./messages.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const entities_1 = require("../../database/entities");
let MessagesController = class MessagesController {
    messagesService;
    constructor(messagesService) {
        this.messagesService = messagesService;
    }
    async createConversation(user, createConversationDto) {
        return this.messagesService.createConversation(user.id, createConversationDto);
    }
    async getConversationByBooking(user, bookingId) {
        return this.messagesService.getConversationByBooking(user.id, bookingId);
    }
    async getUserConversations(user, limit, offset) {
        return this.messagesService.getUserConversations(user.id, limit, offset);
    }
    async getConversation(user, conversationId) {
        return this.messagesService.getConversation(user.id, conversationId);
    }
    async sendMessage(user, sendMessageDto) {
        return this.messagesService.sendMessage(user.id, sendMessageDto);
    }
    async getMessages(user, conversationId, limit, offset) {
        return this.messagesService.getMessages(user.id, conversationId, limit, offset);
    }
    async markMessagesAsRead(user, markReadDto) {
        return this.messagesService.markMessagesAsRead(user.id, markReadDto);
    }
    async getUnreadCount(user) {
        const count = await this.messagesService.getUnreadCount(user.id);
        return { unread_count: count };
    }
    async getUnreadCountByConversation(user, conversationId) {
        const count = await this.messagesService.getUnreadCountByConversation(user.id, conversationId);
        return { unread_count: count };
    }
};
exports.MessagesController = MessagesController;
__decorate([
    (0, common_1.Post)('conversations'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.UserEntity,
        dto_1.CreateConversationDto]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "createConversation", null);
__decorate([
    (0, common_1.Get)('conversations/booking/:bookingId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('bookingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.UserEntity, String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getConversationByBooking", null);
__decorate([
    (0, common_1.Get)('conversations'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('offset', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.UserEntity, Number, Number]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getUserConversations", null);
__decorate([
    (0, common_1.Get)('conversations/:conversationId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.UserEntity, String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getConversation", null);
__decorate([
    (0, common_1.Post)('send'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.UserEntity,
        dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)('conversations/:conversationId/messages'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('conversationId')),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(50), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('offset', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.UserEntity, String, Number, Number]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Put)('mark-read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.UserEntity,
        dto_1.MarkMessagesReadDto]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "markMessagesAsRead", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.UserEntity]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Get)('conversations/:conversationId/unread-count'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.UserEntity, String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getUnreadCountByConversation", null);
exports.MessagesController = MessagesController = __decorate([
    (0, common_1.Controller)('messages'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [messages_service_1.MessagesService])
], MessagesController);
//# sourceMappingURL=messages.controller.js.map