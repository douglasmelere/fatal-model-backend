"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let EmailService = EmailService_1 = class EmailService {
    configService;
    transporter;
    logger = new common_1.Logger(EmailService_1.name);
    constructor(configService) {
        this.configService = configService;
        this.initializeTransporter();
    }
    initializeTransporter() {
        const emailHost = this.configService.get('EMAIL_HOST');
        const emailPort = this.configService.get('EMAIL_PORT');
        const emailUser = this.configService.get('EMAIL_USER');
        const emailPassword = this.configService.get('EMAIL_PASSWORD');
        if (!emailHost || !emailUser || !emailPassword) {
            this.logger.warn('Email configuration incomplete. Email service disabled.');
            return;
        }
        this.transporter = nodemailer.createTransport({
            host: emailHost,
            port: emailPort || 587,
            secure: false,
            auth: {
                user: emailUser,
                pass: emailPassword,
            },
        });
    }
    async sendBookingRequestEmail(escortEmail, clientName, bookingDetails) {
        try {
            if (!this.transporter) {
                this.logger.warn('Email transporter not configured');
                return false;
            }
            const mailOptions = {
                from: this.configService.get('EMAIL_FROM'),
                to: escortEmail,
                subject: 'Novo Agendamento Recebido',
                html: `
          <h2>Novo Agendamento</h2>
          <p>Você recebeu um novo agendamento de <strong>${clientName}</strong></p>
          <p><strong>Data:</strong> ${new Date(bookingDetails.scheduled_date).toLocaleString('pt-BR')}</p>
          <p><strong>Duração:</strong> ${bookingDetails.duration} minutos</p>
          <p><strong>Preço:</strong> R$ ${bookingDetails.total_price.toFixed(2)}</p>
          <p>Acesse sua conta para confirmar ou rejeitar o agendamento.</p>
        `,
            };
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Booking request email sent to ${escortEmail}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send email: ${error.message}`);
            return false;
        }
    }
    async sendPaymentConfirmationEmail(clientEmail, escortName, paymentDetails) {
        try {
            if (!this.transporter) {
                this.logger.warn('Email transporter not configured');
                return false;
            }
            const mailOptions = {
                from: this.configService.get('EMAIL_FROM'),
                to: clientEmail,
                subject: 'Pagamento Confirmado',
                html: `
          <h2>Pagamento Confirmado</h2>
          <p>Seu pagamento para <strong>${escortName}</strong> foi confirmado.</p>
          <p><strong>Valor:</strong> R$ ${paymentDetails.amount.toFixed(2)}</p>
          <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          <p>Obrigado por usar nosso serviço!</p>
        `,
            };
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Payment confirmation email sent to ${clientEmail}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send email: ${error.message}`);
            return false;
        }
    }
    async sendReviewNotificationEmail(escortEmail, clientName, rating, comment) {
        try {
            if (!this.transporter) {
                this.logger.warn('Email transporter not configured');
                return false;
            }
            const mailOptions = {
                from: this.configService.get('EMAIL_FROM'),
                to: escortEmail,
                subject: 'Nova Avaliação Recebida',
                html: `
          <h2>Nova Avaliação</h2>
          <p>Você recebeu uma nova avaliação de <strong>${clientName}</strong></p>
          <p><strong>Rating:</strong> ${'⭐'.repeat(rating)}</p>
          <p><strong>Comentário:</strong> ${comment || 'Sem comentário'}</p>
          <p>Acesse sua conta para responder à avaliação.</p>
        `,
            };
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Review notification email sent to ${escortEmail}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send email: ${error.message}`);
            return false;
        }
    }
    async sendWelcomeEmail(userEmail, userName) {
        try {
            if (!this.transporter) {
                this.logger.warn('Email transporter not configured');
                return false;
            }
            const mailOptions = {
                from: this.configService.get('EMAIL_FROM'),
                to: userEmail,
                subject: 'Bem-vindo ao Fatal Model',
                html: `
          <h2>Bem-vindo, ${userName}!</h2>
          <p>Sua conta foi criada com sucesso.</p>
          <p>Acesse sua conta para completar seu perfil e começar a usar nossos serviços.</p>
          <p>Se tiver dúvidas, entre em contato com nosso suporte.</p>
        `,
            };
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Welcome email sent to ${userEmail}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send email: ${error.message}`);
            return false;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map