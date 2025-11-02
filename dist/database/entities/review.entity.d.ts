import { UserEntity } from './user.entity';
import { AppointmentEntity } from './appointment.entity';
export declare class ReviewEntity {
    id: string;
    appointment_id: string;
    client_id: string;
    escort_id: string;
    rating: number;
    comment: string;
    is_anonymous: boolean;
    response_from_escort: string;
    responded_at: Date;
    is_verified_purchase: boolean;
    metadata: Record<string, any>;
    created_at: Date;
    updated_at: Date;
    appointment: AppointmentEntity;
    client: UserEntity;
    escort: UserEntity;
}
