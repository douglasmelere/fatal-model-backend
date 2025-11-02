import { ProfileEntity } from './profile.entity';
import { AppointmentEntity } from './appointment.entity';
import { PaymentEntity } from './payment.entity';
import { ReviewEntity } from './review.entity';
import { ConversationEntity } from './conversation.entity';
export declare enum UserRole {
    CLIENT = "CLIENT",
    ESCORT = "ESCORT",
    ADMIN = "ADMIN"
}
export declare enum VerificationStatus {
    PENDING = "PENDING",
    VERIFIED = "VERIFIED",
    REJECTED = "REJECTED"
}
export declare enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED",
    BANNED = "BANNED"
}
export declare class UserEntity {
    id: string;
    email: string;
    password: string;
    role: UserRole;
    status: UserStatus;
    verification_status: VerificationStatus;
    phone: string;
    phone_verified: boolean;
    first_name: string;
    last_name: string;
    avatar_url: string;
    last_login: Date;
    email_notifications: boolean;
    sms_notifications: boolean;
    created_at: Date;
    updated_at: Date;
    profile: ProfileEntity;
    appointments_as_client: AppointmentEntity[];
    appointments_as_escort: AppointmentEntity[];
    payments_as_client: PaymentEntity[];
    payments_as_escort: PaymentEntity[];
    reviews_as_client: ReviewEntity[];
    reviews_as_escort: ReviewEntity[];
    conversations_as_client: ConversationEntity[];
    conversations_as_escort: ConversationEntity[];
}
