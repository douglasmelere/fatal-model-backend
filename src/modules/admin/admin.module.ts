import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UserEntity, ProfileEntity, PaymentEntity, AppointmentEntity } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, ProfileEntity, PaymentEntity, AppointmentEntity])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
