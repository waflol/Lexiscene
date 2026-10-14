import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { buildProblem } from '../problem.js';

@Catch()
export class ProblemJsonFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemJsonFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const _req = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();

      // Nếu body đã là problem+json (từ pipe), pass-through
      if (this.isProblemJson(body)) {
        res.status(status).type('application/problem+json').json(body);
        return;
      }

      // String message mặc định của HttpException
      const message =
        typeof body === 'string' ? body : ((body as any).message ?? 'Error');
      const problem = buildProblem({
        type: `https://lexiscene.app/problems/${this.slug(status)}`,
        title: this.titleFor(status),
        status,
        code: this.codeFor(status),
        detail: Array.isArray(message) ? message.join('; ') : message,
      });
      res.status(status).type('application/problem+json').json(problem);
      return;
    }

    // Unknown error: log full, return generic 500
    this.logger.error(exception);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .type('application/problem+json')
      .json(
        buildProblem({
          type: 'https://lexiscene.app/problems/internal',
          title: 'Internal server error',
          status: 500,
          code: 'INTERNAL_ERROR',
        }),
      );
  }

  private isProblemJson(body: unknown): boolean {
    return (
      typeof body === 'object' &&
      body !== null &&
      'type' in body &&
      'code' in body
    );
  }

  private slug(status: number) {
    return this.codeFor(status).toLowerCase().replace(/_/g, '-');
  }

  private titleFor(status: number) {
    return HttpStatus[status] ?? 'Error';
  }

  private codeFor(status: number) {
    return (
      (
        {
          400: 'BAD_REQUEST',
          401: 'UNAUTHENTICATED',
          403: 'FORBIDDEN',
          404: 'NOT_FOUND',
          409: 'CONFLICT',
          422: 'VALIDATION_ERROR',
          429: 'RATE_LIMITED',
        } as Record<number, string>
      )[status] ?? 'ERROR'
    );
  }
}
