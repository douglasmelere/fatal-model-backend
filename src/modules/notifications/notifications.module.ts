import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsGateway } from './notifications.gateway';
import { EmailService } from './email.service';

@Module({
  imports: [JwtModule],
  providers: [NotificationsGateway, EmailService],
  exports: [EmailService, NotificationsGateway],
})
export class NotificationsModule {}
