import { UserEntity } from './user.entity';
import { ConversationEntity } from './conversation.entity';
export declare enum MessageType {
    TEXT = "TEXT",
    IMAGE = "IMAGE",
    SYSTEM = "SYSTEM"
}
export declare class MessageEntity {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    message_type: MessageType;
    is_read: boolean;
    read_at: Date;
    metadata: Record<string, any>;
    created_at: Date;
    updated_at: Date;
    conversation: ConversationEntity;
    sender: UserEntity;
}
