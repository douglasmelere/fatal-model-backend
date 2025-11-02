import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
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

  async sendBookingRequestEmail(
    escortEmail: string,
    clientName: string,
    bookingDetails: any,
  ): Promise<boolean> {
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
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      return false;
    }
  }

  async sendPaymentConfirmationEmail(
    clientEmail: string,
    escortName: string,
    paymentDetails: any,
  ): Promise<boolean> {
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
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      return false;
    }
  }

  async sendReviewNotificationEmail(
    escortEmail: string,
    clientName: string,
    rating: number,
    comment: string,
  ): Promise<boolean> {
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
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      return false;
    }
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
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
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      return false;
    }
  }
}
