"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const entities_1 = require("../../database/entities");
const services_1 = require("../../common/services");
const pix_utils_1 = require("pix-utils");
let PaymentsService = class PaymentsService {
    paymentsRepository;
    usersRepository;
    profilesRepository;
    qrcodeService;
    constructor(paymentsRepository, usersRepository, profilesRepository, qrcodeService) {
        this.paymentsRepository = paymentsRepository;
        this.usersRepository = usersRepository;
        this.profilesRepository = profilesRepository;
        this.qrcodeService = qrcodeService;
    }
    async createPayment(clientId, createPaymentDto) {
        const { escort_id, amount, description, payment_method, appointment_id } = createPaymentDto;
        const escort = await this.usersRepository.findOne({
            where: { id: escort_id },
        });
        if (!escort) {
            throw new common_1.NotFoundException('Escort not found');
        }
        const escortProfile = await this.profilesRepository.findOne({
            where: { user_id: escort_id },
        });
        if (!escortProfile || !escortProfile.pix_key) {
            throw new common_1.BadRequestException('Escort does not have a PIX key configured');
        }
        const payment = this.paymentsRepository.create({
            client_id: clientId,
            escort_id,
            amount,
            description,
            payment_method: payment_method || entities_1.PaymentMethod.PIX,
            appointment_id,
            pix_key: escortProfile.pix_key,
            pix_key_type: escortProfile.pix_key_type,
            status: entities_1.PaymentStatus.PENDING,
        });
        const savedPayment = await this.paymentsRepository.save(payment);
        const qrCodeData = await this.generatePixQRCode(savedPayment, escortProfile);
        savedPayment.qr_code = qrCodeData;
        savedPayment.pix_copy_paste = this.generatePixCopyPaste(escortProfile, amount, savedPayment.pix_key);
        return this.paymentsRepository.save(savedPayment);
    }
    async getPaymentById(paymentId) {
        const payment = await this.paymentsRepository.findOne({
            where: { id: paymentId },
            relations: ['client', 'escort'],
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        return payment;
    }
    async confirmPayment(paymentId, escortId, confirmPaymentDto) {
        const payment = await this.getPaymentById(paymentId);
        if (payment.escort_id !== escortId) {
            throw new common_1.ForbiddenException('Only the escort can confirm this payment');
        }
        if (payment.status !== entities_1.PaymentStatus.PENDING) {
            throw new common_1.BadRequestException('Payment cannot be confirmed in its current status');
        }
        payment.status = entities_1.PaymentStatus.CONFIRMED;
        payment.confirmed_by_escort = true;
        payment.confirmed_at = new Date();
        payment.transaction_id = confirmPaymentDto.transaction_id;
        payment.confirmation_notes = confirmPaymentDto.confirmation_notes || '';
        return this.paymentsRepository.save(payment);
    }
    async uploadPaymentProof(paymentId, clientId, proofImageUrl) {
        const payment = await this.getPaymentById(paymentId);
        if (payment.client_id !== clientId) {
            throw new common_1.ForbiddenException('Only the client can upload proof for this payment');
        }
        payment.payment_proof_image = proofImageUrl;
        payment.status = entities_1.PaymentStatus.PAID;
        return this.paymentsRepository.save(payment);
    }
    async getPaymentHistory(userId, userRole, limit = 10, offset = 0) {
        const limitNum = Number(limit) || 10;
        const offsetNum = Number(offset) || 0;
        let query = this.paymentsRepository
            .createQueryBuilder('payment')
            .leftJoinAndSelect('payment.client', 'client')
            .leftJoinAndSelect('payment.escort', 'escort');
        if (userRole === 'CLIENT') {
            query = query.where('payment.client_id = :userId', { userId });
        }
        else if (userRole === 'ESCORT') {
            query = query.where('payment.escort_id = :userId', { userId });
        }
        const [data, total] = await query
            .orderBy('payment.created_at', 'DESC')
            .skip(offsetNum)
            .take(limitNum)
            .getManyAndCount();
        return { data, total };
    }
    async cancelPayment(paymentId, clientId) {
        const payment = await this.getPaymentById(paymentId);
        if (payment.client_id !== clientId) {
            throw new common_1.ForbiddenException('Only the client can cancel this payment');
        }
        if (payment.status === entities_1.PaymentStatus.CONFIRMED) {
            throw new common_1.BadRequestException('Cannot cancel a confirmed payment');
        }
        payment.status = entities_1.PaymentStatus.CANCELLED;
        return this.paymentsRepository.save(payment);
    }
    async generatePixQRCode(payment, escortProfile) {
        const pixData = {
            key: payment.pix_key,
            name: escortProfile.display_name,
            city: escortProfile.location || 'Unknown',
            amount: payment.amount,
        };
        return this.qrcodeService.generatePixQRCode(pixData);
    }
    generatePixCopyPaste(escortProfile, amount, pixKey) {
        try {
            const pixParams = {
                merchantName: escortProfile.display_name.substring(0, 25),
                merchantCity: (escortProfile.location || 'Unknown').substring(0, 15),
                key: pixKey,
                amount: amount,
            };
            const pix = (0, pix_utils_1.createStaticPix)(pixParams);
            if (typeof pix.toBRCode === 'function') {
                return pix.toBRCode();
            }
            else {
                return pixKey;
            }
        }
        catch (error) {
            return pixKey;
        }
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(entities_1.PaymentEntity)),
    __param(1, (0, typeorm_2.InjectRepository)(entities_1.UserEntity)),
    __param(2, (0, typeorm_2.InjectRepository)(entities_1.ProfileEntity)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        services_1.QRCodeService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map