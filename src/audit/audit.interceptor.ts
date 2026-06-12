import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { sanitizeAuditRequestBody } from './audit-sanitizer';
import { AuditService } from './audit.service';

const SKIP_PATH_PREFIXES = ['/api/health', '/api/metrics', '/api/docs'];

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (!this.auditService.isEnabled()) {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<{
      method: string;
      url?: string;
      ip?: string;
      headers: Record<string, string | string[] | undefined>;
      body?: unknown;
      user?: { sub?: number; nickname?: string };
    }>();

    const path = request.url?.split('?')[0] ?? '';
    if (SKIP_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))) {
      return next.handle();
    }

    const startedAt = Date.now();
    const method = request.method;
    const user = request.user;

    const record = (statusCode: number) => {
      void this.auditService.record({
        method,
        path,
        statusCode,
        userId: user?.sub,
        nickname: user?.nickname,
        ip: request.ip,
        userAgent: this.headerValue(request.headers['user-agent']),
        requestBody: sanitizeAuditRequestBody(request.body),
        durationMs: Date.now() - startedAt,
      });
    };

    return next.handle().pipe(
      tap({
        next: () => {
          const response = http.getResponse<{ statusCode: number }>();
          record(response.statusCode);
        },
        error: (error: { status?: number; getStatus?: () => number }) => {
          const statusCode = error?.getStatus?.() ?? error?.status ?? 500;
          record(statusCode);
        },
      }),
    );
  }

  private headerValue(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) return value[0];
    return value;
  }
}
