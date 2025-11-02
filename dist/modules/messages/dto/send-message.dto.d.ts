import { MessageType } from '../../../database/entities/message.entity';
export declare class SendMessageDto {
    conversation_id: string;
    content: string;
    message_type?: MessageType;
    metadata?: Record<string, any>;
}
