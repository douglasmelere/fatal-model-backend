import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentEntity, UserEntity, ProfileEntity } from '../../database/entities';
import { QRCodeService } from '../../common/services';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity, UserEntity, ProfileEntity])],
  controllers: [PaymentsController],
  providers: [PaymentsService, QRCodeService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
