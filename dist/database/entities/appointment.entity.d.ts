import { UserEntity } from './user.entity';
import { PaymentEntity } from './payment.entity';
import { ReviewEntity } from './review.entity';
import { ConversationEntity } from './conversation.entity';
export declare enum AppointmentStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    NO_SHOW = "NO_SHOW"
}
export declare class AppointmentEntity {
    id: string;
    client_id: string;
    escort_id: string;
    scheduled_date: Date;
    duration: number;
    service_type: string;
    total_price: number;
    status: AppointmentStatus;
    location: string;
    special_requests: string;
    payment_id: string;
    review_id: string;
    cancellation_reason: string;
    completed_at: Date;
    metadata: Record<string, any>;
    created_at: Date;
    updated_at: Date;
    client: UserEntity;
    escort: UserEntity;
    payment: PaymentEntity;
    review: ReviewEntity;
    conversation: ConversationEntity;
}
