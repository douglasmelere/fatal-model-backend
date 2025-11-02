import { IsUUID } from 'class-validator';

export class CreateConversationDto {
  @IsUUID()
  booking_id: string;
}

