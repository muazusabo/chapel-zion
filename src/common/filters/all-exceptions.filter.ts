import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  private describeException(exception: unknown): string {
    if (exception instanceof Error) {
      return `${exception.name}: ${exception.message}`;
    }
    if (typeof exception === 'string') return exception;
    if (typeof exception !== 'object' || exception === null) return String(exception);

    const details = exception as Record<string, unknown>;
    const fields = ['name', 'code', 'http_code', 'message']
      .map((key) => {
        const value = details[key];
        return typeof value === 'string' || typeof value === 'number'
          ? `${key}=${value}`
          : null;
      })
      .filter((value): value is string => value !== null);

    const nestedError = details.error;
    if (typeof nestedError === 'object' && nestedError !== null) {
      const nestedMessage = (nestedError as Record<string, unknown>).message;
      if (typeof nestedMessage === 'string') fields.push(`error=${nestedMessage}`);
    }

    return fields.length > 0 ? fields.join(' ') : Object.prototype.toString.call(exception);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Something went wrong. Please try again later.';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        message = (res as any).message ?? message;
        error = (res as any).error ?? error;
      }
    } else if (exception instanceof Error) {
      // Never leak internal error details/stack traces to the client.
      this.logger.error(exception.message, exception.stack);
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}: ${this.describeException(exception)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      error,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
