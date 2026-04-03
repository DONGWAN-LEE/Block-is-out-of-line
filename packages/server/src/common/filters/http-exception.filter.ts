import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../dto/response.dto.js';
import { ErrorDto } from '../dto/error.dto.js';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let error: ErrorDto;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      let message: string;
      let details: any;

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, any>;
        message = resp['message'] ?? exception.message;
        if (Array.isArray(resp['message'])) {
          message = 'Validation failed';
          details = resp['message'];
        }
      } else {
        message = exception.message;
      }

      const code = `HTTP_${status}`;
      error = new ErrorDto(code, message, details);
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      error = new ErrorDto('INTERNAL_SERVER_ERROR', 'Internal server error');

      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json(ApiResponse.fail(error));
  }
}
