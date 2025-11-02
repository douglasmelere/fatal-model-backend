import { IsUUID, IsOptional, IsArray } from 'class-validator';

export class MarkMessagesReadDto {
  @IsUUID()
  conversation_id: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  message_ids?: string[]; // Se não fornecido, marca todas como lidas
}

