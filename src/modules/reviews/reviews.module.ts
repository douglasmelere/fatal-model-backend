import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { ReviewEntity, AppointmentEntity, ProfileEntity } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewEntity, AppointmentEntity, ProfileEntity])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
