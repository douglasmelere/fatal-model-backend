import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentEntity, PaymentStatus, UserEntity, ProfileEntity, PaymentMethod } from '../../database/entities';
import { CreatePaymentDto, ConfirmPaymentDto } from './dto';
import { QRCodeService } from '../../common/services';
import { createStaticPix } from 'pix-utils';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentEntity)
    private paymentsRepository: Repository<PaymentEntity>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profilesRepository: Repository<ProfileEntity>,
    private qrcodeService: QRCodeService,
  ) {}

  async createPayment(
    clientId: string,
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentEntity> {
    const { escort_id, amount, description, payment_method, appointment_id } =
      createPaymentDto;

    // Verify escort exists
    const escort = await this.usersRepository.findOne({
      where: { id: escort_id },
    });

    if (!escort) {
      throw new NotFoundException('Escort not found');
    }

    // Get escort profile to get PIX key
    const escortProfile = await this.profilesRepository.findOne({
      where: { user_id: escort_id },
    });

    if (!escortProfile || !escortProfile.pix_key) {
      throw new BadRequestException(
        'Escort does not have a PIX key configured',
      );
    }

    // Create payment
    const payment = this.paymentsRepository.create({
      client_id: clientId,
      escort_id,
      amount,
      description,
      payment_method: payment_method || PaymentMethod.PIX,
      appointment_id,
      pix_key: escortProfile.pix_key,
      pix_key_type: escortProfile.pix_key_type,
      status: PaymentStatus.PENDING,
    });

    const savedPayment = await this.paymentsRepository.save(payment);

    // Generate PIX QR code
    const qrCodeData = await this.generatePixQRCode(
      savedPayment,
      escortProfile,
    );
    savedPayment.qr_code = qrCodeData;
    savedPayment.pix_copy_paste = this.generatePixCopyPaste(
      escortProfile,
      amount,
      savedPayment.pix_key,
    );

    return this.paymentsRepository.save(savedPayment);
  }

  async getPaymentById(paymentId: string): Promise<PaymentEntity> {
    const payment = await this.paymentsRepository.findOne({
      where: { id: paymentId },
      relations: ['client', 'escort'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async confirmPayment(
    paymentId: string,
    escortId: string,
    confirmPaymentDto: ConfirmPaymentDto,
  ): Promise<PaymentEntity> {
    const payment = await this.getPaymentById(paymentId);

    // Verify that the user is the escort
    if (payment.escort_id !== escortId) {
      throw new ForbiddenException(
        'Only the escort can confirm this payment',
      );
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(
        'Payment cannot be confirmed in its current status',
      );
    }

    payment.status = PaymentStatus.CONFIRMED;
    payment.confirmed_by_escort = true;
    payment.confirmed_at = new Date();
    payment.transaction_id = confirmPaymentDto.transaction_id;
    payment.confirmation_notes = confirmPaymentDto.confirmation_notes || '';

    return this.paymentsRepository.save(payment);
  }

  async uploadPaymentProof(
    paymentId: string,
    clientId: string,
    proofImageUrl: string,
  ): Promise<PaymentEntity> {
    const payment = await this.getPaymentById(paymentId);

    // Verify that the user is the client
    if (payment.client_id !== clientId) {
      throw new ForbiddenException(
        'Only the client can upload proof for this payment',
      );
    }

    payment.payment_proof_image = proofImageUrl;
    payment.status = PaymentStatus.PAID;

    return this.paymentsRepository.save(payment);
  }

  async getPaymentHistory(
    userId: string,
    userRole: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ data: PaymentEntity[]; total: number }> {
    // Ensure limit and offset are numbers
    const limitNum = Number(limit) || 10;
    const offsetNum = Number(offset) || 0;

    let query = this.paymentsRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.client', 'client')
      .leftJoinAndSelect('payment.escort', 'escort');

    if (userRole === 'CLIENT') {
      query = query.where('payment.client_id = :userId', { userId });
    } else if (userRole === 'ESCORT') {
      query = query.where('payment.escort_id = :userId', { userId });
    }

    const [data, total] = await query
      .orderBy('payment.created_at', 'DESC')
      .skip(offsetNum)
      .take(limitNum)
      .getManyAndCount();

    return { data, total };
  }

  async cancelPayment(
    paymentId: string,
    clientId: string,
  ): Promise<PaymentEntity> {
    const payment = await this.getPaymentById(paymentId);

    // Verify that the user is the client
    if (payment.client_id !== clientId) {
      throw new ForbiddenException(
        'Only the client can cancel this payment',
      );
    }

    if (payment.status === PaymentStatus.CONFIRMED) {
      throw new BadRequestException(
        'Cannot cancel a confirmed payment',
      );
    }

    payment.status = PaymentStatus.CANCELLED;
    return this.paymentsRepository.save(payment);
  }

  private async generatePixQRCode(
    payment: PaymentEntity,
    escortProfile: ProfileEntity,
  ): Promise<string> {
    const pixData = {
      key: payment.pix_key,
      name: escortProfile.display_name,
      city: escortProfile.location || 'Unknown',
      amount: payment.amount,
    };

    return this.qrcodeService.generatePixQRCode(pixData);
  }

  private generatePixCopyPaste(
    escortProfile: ProfileEntity,
    amount: number,
    pixKey: string,
  ): string {
    // Use pix-utils library to generate proper PIX code
    try {
      const pixParams: any = {
        merchantName: escortProfile.display_name.substring(0, 25),
        merchantCity: (escortProfile.location || 'Unknown').substring(0, 15),
        key: pixKey,
        amount: amount,
      };

      const pix: any = createStaticPix(pixParams);
      
      // Check if result has toBRCode method (success case)
      if (typeof pix.toBRCode === 'function') {
        return pix.toBRCode();
      } else {
        // Error case - fallback
        return pixKey;
      }
    } catch (error) {
      // Fallback to returning just the PIX key
      return pixKey;
    }
  }
}
