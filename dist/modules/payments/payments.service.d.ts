import { Repository } from 'typeorm';
import { PaymentEntity, UserEntity, ProfileEntity } from '../../database/entities';
import { CreatePaymentDto, ConfirmPaymentDto } from './dto';
import { QRCodeService } from '../../common/services';
export declare class PaymentsService {
    private paymentsRepository;
    private usersRepository;
    private profilesRepository;
    private qrcodeService;
    constructor(paymentsRepository: Repository<PaymentEntity>, usersRepository: Repository<UserEntity>, profilesRepository: Repository<ProfileEntity>, qrcodeService: QRCodeService);
    createPayment(clientId: string, createPaymentDto: CreatePaymentDto): Promise<PaymentEntity>;
    getPaymentById(paymentId: string): Promise<PaymentEntity>;
    confirmPayment(paymentId: string, escortId: string, confirmPaymentDto: ConfirmPaymentDto): Promise<PaymentEntity>;
    uploadPaymentProof(paymentId: string, clientId: string, proofImageUrl: string): Promise<PaymentEntity>;
    getPaymentHistory(userId: string, userRole: string, limit?: number, offset?: number): Promise<{
        data: PaymentEntity[];
        total: number;
    }>;
    cancelPayment(paymentId: string, clientId: string): Promise<PaymentEntity>;
    private generatePixQRCode;
    private generatePixCopyPaste;
}
