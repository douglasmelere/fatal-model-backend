"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const filters_1 = require("./common/filters");
const services_1 = require("./common/services");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const logger = new services_1.WinstonLoggerService();
    app.useLogger(logger);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new filters_1.HttpExceptionFilter(), new filters_1.AllExceptionsFilter());
    app.enableCors({
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
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
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.APP_PORT || 3000;
    const host = process.env.APP_HOST || '0.0.0.0';
    await app.listen(port, host);
    logger.log(`Application is running on http://${host}:${port}`);
    logger.log(`Swagger documentation available at http://${host}:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map