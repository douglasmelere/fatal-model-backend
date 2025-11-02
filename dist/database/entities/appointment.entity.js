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
exports.AppointmentEntity = exports.AppointmentStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const payment_entity_1 = require("./payment.entity");
const review_entity_1 = require("./review.entity");
const conversation_entity_1 = require("./conversation.entity");
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["PENDING"] = "PENDING";
    AppointmentStatus["CONFIRMED"] = "CONFIRMED";
    AppointmentStatus["IN_PROGRESS"] = "IN_PROGRESS";
    AppointmentStatus["COMPLETED"] = "COMPLETED";
    AppointmentStatus["CANCELLED"] = "CANCELLED";
    AppointmentStatus["NO_SHOW"] = "NO_SHOW";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
let AppointmentEntity = class AppointmentEntity {
    id;
    client_id;
    escort_id;
    scheduled_date;
    duration;
    service_type;
    total_price;
    status;
    location;
    special_requests;
    payment_id;
    review_id;
    cancellation_reason;
    completed_at;
    metadata;
    created_at;
    updated_at;
    client;
    escort;
    payment;
    review;
    conversation;
};
exports.AppointmentEntity = AppointmentEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AppointmentEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], AppointmentEntity.prototype, "client_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], AppointmentEntity.prototype, "escort_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], AppointmentEntity.prototype, "scheduled_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], AppointmentEntity.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], AppointmentEntity.prototype, "service_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], AppointmentEntity.prototype, "total_price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AppointmentStatus,
        default: AppointmentStatus.PENDING,
    }),
    __metadata("design:type", String)
], AppointmentEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], AppointmentEntity.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AppointmentEntity.prototype, "special_requests", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], AppointmentEntity.prototype, "payment_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], AppointmentEntity.prototype, "review_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AppointmentEntity.prototype, "cancellation_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], AppointmentEntity.prototype, "completed_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AppointmentEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AppointmentEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AppointmentEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, (user) => user.appointments_as_client),
    (0, typeorm_1.JoinColumn)({ name: 'client_id' }),
    __metadata("design:type", user_entity_1.UserEntity)
], AppointmentEntity.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, (user) => user.appointments_as_escort),
    (0, typeorm_1.JoinColumn)({ name: 'escort_id' }),
    __metadata("design:type", user_entity_1.UserEntity)
], AppointmentEntity.prototype, "escort", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => payment_entity_1.PaymentEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'payment_id' }),
    __metadata("design:type", payment_entity_1.PaymentEntity)
], AppointmentEntity.prototype, "payment", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => review_entity_1.ReviewEntity, (review) => review.appointment, {
        nullable: true,
    }),
    __metadata("design:type", review_entity_1.ReviewEntity)
], AppointmentEntity.prototype, "review", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => conversation_entity_1.ConversationEntity, (conversation) => conversation.booking, {
        nullable: true,
    }),
    __metadata("design:type", conversation_entity_1.ConversationEntity)
], AppointmentEntity.prototype, "conversation", void 0);
exports.AppointmentEntity = AppointmentEntity = __decorate([
    (0, typeorm_1.Entity)('appointments'),
    (0, typeorm_1.Index)(['escort_id', 'scheduled_date', 'status']),
    (0, typeorm_1.Index)(['client_id', 'status'])
], AppointmentEntity);
//# sourceMappingURL=appointment.entity.js.map