import {
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  IsObject,
} from 'class-validator';
import { MessageType } from '../../../database/entities/message.entity';

export class SendMessageDto {
  @IsUUID()
  conversation_id: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(MessageType)
  message_type?: MessageType;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

