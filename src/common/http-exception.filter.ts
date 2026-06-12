import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

type ErrorResponseBody = {
  message?: string | string[];
  error?: string;
  errors?: unknown;
};

type MssqlDriverError = {
  number?: number;
};

const UNIQUE_VIOLATION_CODES = new Set([2601, 2627]);

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<{ url: string; method: string }>();

    const payload = this.toPayload(exception);

    response.status(payload.statusCode).json({
      success: false,
      statusCode: payload.statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: {
        code: payload.code,
        message: payload.message,
        details: payload.details,
      },
    });
  }

  private toPayload(exception: unknown) {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'string') {
        return {
          statusCode,
          code: this.statusCodeName(statusCode),
          message: body,
          details: undefined,
        };
      }

      const responseBody = body as ErrorResponseBody;
      const message = Array.isArray(responseBody.message)
        ? responseBody.message.join('; ')
        : responseBody.message || exception.message;

      return {
        statusCode,
        code: responseBody.error || this.statusCodeName(statusCode),
        message,
        details: responseBody.errors,
      };
    }

    if (exception instanceof QueryFailedError) {
      const driverError = exception.driverError as MssqlDriverError;
      if (driverError?.number && UNIQUE_VIOLATION_CODES.has(driverError.number)) {
        return {
          statusCode: HttpStatus.CONFLICT,
          code: 'UniqueConstraintViolation',
          message: 'Registro duplicado para campo unico',
          details: undefined,
        };
      }

      return {
        statusCode: HttpStatus.CONFLICT,
        code: 'DatabaseError',
        message: 'Violacao de restricao do banco de dados',
        details: undefined,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'InternalServerError',
      message: 'Erro interno do servidor',
      details: undefined,
    };
  }

  private statusCodeName(statusCode: number): string {
    return HttpStatus[statusCode] || 'HttpError';
  }
}
