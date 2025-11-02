import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter, AllExceptionsFilter } from './common/filters';
import { WinstonLoggerService } from './common/services';
import { RateLimitMiddleware, RequestLoggingMiddleware } from './common/middleware';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Logger
  const logger = new WinstonLoggerService();
  app.useLogger(logger);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filters
  app.useGlobalFilters(new HttpExceptionFilter(), new AllExceptionsFilter());

  // Middleware
  // app.use(new RequestLoggingMiddleware());
  // app.use(new RateLimitMiddleware(app.get(ConfigService)));

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Fatal Model Backend API')
    .setDescription('Robust and scalable backend for a Fatal Model-like system')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Profiles', 'Profile management endpoints')
    .addTag('Payments', 'Payment management endpoints')
    .addTag('Search', 'Search and filtering endpoints')
    .addTag('AI Recommendations', 'AI-powered recommendation endpoints')
    .addTag('Bookings', 'Booking management endpoints')
    .addTag('Reviews', 'Review management endpoints')
    .addTag('Admin', 'Administrative endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.APP_PORT || 3000;
  const host = process.env.APP_HOST || '0.0.0.0';

  await app.listen(port, host);
  logger.log(`Application is running on http://${host}:${port}`);
  logger.log(`Swagger documentation available at http://${host}:${port}/api/docs`);
}

bootstrap();
