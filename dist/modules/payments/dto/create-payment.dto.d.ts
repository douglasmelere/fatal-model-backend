import { PaymentMethod } from '../../../database/entities';
export declare class CreatePaymentDto {
    escort_id: string;
    amount: number;
    description?: string;
    payment_method?: PaymentMethod;
    appointment_id?: string;
}
