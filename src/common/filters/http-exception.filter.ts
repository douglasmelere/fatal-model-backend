import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string | string[] = exception.message;
    let errors: any = undefined;

    if (typeof exceptionResponse === 'object') {
      // NestJS ValidationPipe returns messages in 'message' property (can be array or string)
      if ('message' in exceptionResponse) {
        message = (exceptionResponse as any).message;
      }
      // Validation errors are in 'errors' property
      if ('errors' in exceptionResponse) {
        errors = (exceptionResponse as any).errors;
      }
    }

    // Log full error details for debugging
    this.logger.error(
      `HTTP Exception: ${status} - ${JSON.stringify({ message, errors, exceptionResponse })}`,
      exception.stack,
    );

    const responseBody: any = {
      statusCode: status,
      message: Array.isArray(message) ? message : [message || 'Internal Server Error'],
      timestamp: new Date().toISOString(),
    };

    if (errors) {
      responseBody.errors = errors;
    }

    response.status(status).json(responseBody);
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'object' && 'message' in exceptionResponse
          ? (exceptionResponse as any).message
          : exception.message;
      this.logger.error(
        `HTTP Exception: ${status} - ${message}`,
        exception.stack,
      );
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(
        `Unhandled Exception: ${message}`,
        exception.stack,
      );
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
    });
  }
}
