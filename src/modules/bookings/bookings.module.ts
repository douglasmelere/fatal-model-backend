import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { AppointmentsAliasController } from './appointments-alias.controller';
import {
  AppointmentEntity,
  UserEntity,
  ProfileEntity,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppointmentEntity, UserEntity, ProfileEntity]),
  ],
  controllers: [BookingsController, AppointmentsAliasController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
