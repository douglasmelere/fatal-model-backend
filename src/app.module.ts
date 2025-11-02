import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SearchModule } from './modules/search/search.module';
import { AiModule } from './modules/ai/ai.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { DebugController } from './debug.controller';
import { appConfig, databaseConfig, redisConfig, jwtConfig, awsConfig, emailConfig, openaiConfig } from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, jwtConfig, awsConfig, emailConfig, openaiConfig],
    }),
    DatabaseModule,
    CommonModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    PaymentsModule,
    SearchModule,
    AiModule,
    BookingsModule,
    ReviewsModule,
    NotificationsModule,
    AdminModule,
  ],
  controllers: [
    DebugController,
  ],
})
export class AppModule {}
