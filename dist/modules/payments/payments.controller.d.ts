import { PaymentsService } from './payments.service';
import { CreatePaymentDto, ConfirmPaymentDto } from './dto';
import { UserEntity } from '../../database/entities';
export declare class PaymentsController {
    private paymentsService;
    constructor(paymentsService: PaymentsService);
    createPayment(user: UserEntity, createPaymentDto: CreatePaymentDto): Promise<import("../../database/entities").PaymentEntity>;
    getPaymentHistory(user: UserEntity, limit: number, offset: number): Promise<{
        data: import("../../database/entities").PaymentEntity[];
        total: number;
    }>;
    getPaymentById(id: string): Promise<import("../../database/entities").PaymentEntity>;
    confirmPayment(paymentId: string, user: UserEntity, confirmPaymentDto: ConfirmPaymentDto): Promise<import("../../database/entities").PaymentEntity>;
    uploadPaymentProof(paymentId: string, user: UserEntity, body: {
        proofImageUrl: string;
    }): Promise<import("../../database/entities").PaymentEntity>;
    cancelPayment(paymentId: string, user: UserEntity): Promise<import("../../database/entities").PaymentEntity>;
}
