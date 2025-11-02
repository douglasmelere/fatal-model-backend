import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private transporter;
    private logger;
    constructor(configService: ConfigService);
    private initializeTransporter;
    sendBookingRequestEmail(escortEmail: string, clientName: string, bookingDetails: any): Promise<boolean>;
    sendPaymentConfirmationEmail(clientEmail: string, escortName: string, paymentDetails: any): Promise<boolean>;
    sendReviewNotificationEmail(escortEmail: string, clientName: string, rating: number, comment: string): Promise<boolean>;
    sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean>;
}
