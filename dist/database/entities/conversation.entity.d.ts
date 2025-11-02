import { UserEntity } from './user.entity';
import { AppointmentEntity } from './appointment.entity';
import { MessageEntity } from './message.entity';
export declare class ConversationEntity {
    id: string;
    client_id: string;
    escort_id: string;
    booking_id: string;
    last_message_at: Date;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    client: UserEntity;
    escort: UserEntity;
    booking: AppointmentEntity;
    messages: MessageEntity[];
}
