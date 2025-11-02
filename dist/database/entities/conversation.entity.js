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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationEntity = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const appointment_entity_1 = require("./appointment.entity");
const message_entity_1 = require("./message.entity");
let ConversationEntity = class ConversationEntity {
    id;
    client_id;
    escort_id;
    booking_id;
    last_message_at;
    is_active;
    created_at;
    updated_at;
    client;
    escort;
    booking;
    messages;
};
exports.ConversationEntity = ConversationEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ConversationEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], ConversationEntity.prototype, "client_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], ConversationEntity.prototype, "escort_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', unique: true }),
    __metadata("design:type", String)
], ConversationEntity.prototype, "booking_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ConversationEntity.prototype, "last_message_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], ConversationEntity.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ConversationEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ConversationEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, (user) => user.conversations_as_client),
    (0, typeorm_1.JoinColumn)({ name: 'client_id' }),
    __metadata("design:type", user_entity_1.UserEntity)
], ConversationEntity.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, (user) => user.conversations_as_escort),
    (0, typeorm_1.JoinColumn)({ name: 'escort_id' }),
    __metadata("design:type", user_entity_1.UserEntity)
], ConversationEntity.prototype, "escort", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => appointment_entity_1.AppointmentEntity, (appointment) => appointment.conversation),
    (0, typeorm_1.JoinColumn)({ name: 'booking_id' }),
    __metadata("design:type", appointment_entity_1.AppointmentEntity)
], ConversationEntity.prototype, "booking", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => message_entity_1.MessageEntity, (message) => message.conversation, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], ConversationEntity.prototype, "messages", void 0);
exports.ConversationEntity = ConversationEntity = __decorate([
    (0, typeorm_1.Entity)('conversations'),
    (0, typeorm_1.Index)(['booking_id'], { unique: true }),
    (0, typeorm_1.Index)(['client_id', 'escort_id'])
], ConversationEntity);
//# sourceMappingURL=conversation.entity.js.map