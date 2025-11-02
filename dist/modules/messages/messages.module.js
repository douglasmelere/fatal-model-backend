"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const entities_1 = require("../../database/entities");
const messages_service_1 = require("./messages.service");
const messages_controller_1 = require("./messages.controller");
const messages_gateway_1 = require("./messages.gateway");
let MessagesModule = class MessagesModule {
};
exports.MessagesModule = MessagesModule;
exports.MessagesModule = MessagesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.ConversationEntity,
                entities_1.MessageEntity,
                entities_1.AppointmentEntity,
                entities_1.UserEntity,
            ]),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    secret: configService.get('JWT_SECRET') || configService.get('jwt.secret') || configService.get('jwt')?.secret,
                    signOptions: {
                        expiresIn: configService.get('JWT_EXPIRATION') || configService.get('jwt.expiresIn') || '3600s',
                    },
                }),
            }),
        ],
        controllers: [messages_controller_1.MessagesController],
        providers: [messages_service_1.MessagesService, messages_gateway_1.MessagesGateway],
        exports: [messages_service_1.MessagesService, messages_gateway_1.MessagesGateway],
    })
], MessagesModule);
//# sourceMappingURL=messages.module.js.map