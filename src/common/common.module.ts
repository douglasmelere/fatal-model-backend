import { Module } from '@nestjs/common';
import { HealthController } from './controllers';
import { WinstonLoggerService, FileUploadService, QRCodeService } from './services';

@Module({
  controllers: [HealthController],
  providers: [WinstonLoggerService, FileUploadService, QRCodeService],
  exports: [WinstonLoggerService, FileUploadService, QRCodeService],
})
export class CommonModule {}
