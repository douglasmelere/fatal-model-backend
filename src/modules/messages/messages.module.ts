import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  ConversationEntity,
  MessageEntity,
  AppointmentEntity,
  UserEntity,
} from '../../database/entities';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MessagesGateway } from './messages.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConversationEntity,
      MessageEntity,
      AppointmentEntity,
      UserEntity,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || configService.get('jwt.secret') || configService.get('jwt')?.secret,
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION') || configService.get('jwt.expiresIn') || '3600s',
        },
      }),
    }),
  ],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway],
  exports: [MessagesService, MessagesGateway],
})
export class MessagesModule {}

