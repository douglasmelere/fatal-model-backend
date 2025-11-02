import { UserEntity } from './user.entity';
export declare enum PaymentStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED"
}
export declare enum PaymentMethod {
    PIX = "PIX",
    CREDIT_CARD = "CREDIT_CARD",
    BANK_TRANSFER = "BANK_TRANSFER"
}
export declare class PaymentEntity {
    id: string;
    client_id: string;
    escort_id: string;
    appointment_id: string;
    amount: number;
    description: string;
    payment_method: PaymentMethod;
    status: PaymentStatus;
    pix_key: string;
    pix_key_type: string;
    qr_code: string;
    pix_copy_paste: string;
    transaction_id: string;
    payment_proof_image: string;
    confirmed_by_escort: boolean;
    confirmed_at: Date;
    confirmation_notes: string;
    metadata: Record<string, any>;
    created_at: Date;
    updated_at: Date;
    client: UserEntity;
    escort: UserEntity;
}
