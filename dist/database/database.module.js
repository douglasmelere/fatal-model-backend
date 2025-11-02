"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const entities_1 = require("./entities");
const migration_service_1 = require("./services/migration.service");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DATABASE_HOST') || 'localhost',
                    port: configService.get('DATABASE_PORT') || 5432,
                    username: configService.get('DATABASE_USER') || 'postgres',
                    password: configService.get('DATABASE_PASSWORD') || 'postgres',
                    database: configService.get('DATABASE_NAME') || 'fatal_model_db',
                    entities: [entities_1.UserEntity, entities_1.ProfileEntity, entities_1.PaymentEntity, entities_1.AppointmentEntity, entities_1.ReviewEntity, entities_1.ConversationEntity, entities_1.MessageEntity],
                    migrations: ['dist/database/migrations/*.js'],
                    migrationsRun: false,
                    migrationsTableName: 'typeorm_migrations',
                    synchronize: process.env.NODE_ENV === 'development',
                    logging: process.env.NODE_ENV === 'development',
                    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
                }),
            }),
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.UserEntity,
                entities_1.ProfileEntity,
                entities_1.PaymentEntity,
                entities_1.AppointmentEntity,
                entities_1.ReviewEntity,
                entities_1.ConversationEntity,
                entities_1.MessageEntity,
            ]),
        ],
        providers: [migration_service_1.MigrationService],
        exports: [typeorm_1.TypeOrmModule],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map