import { Injectable, NestMiddleware } from '@nestjs/common';
import { Counter, Histogram } from 'prom-client';
import { NextFunction, Request, Response } from 'express';

const SKIP_PATH_PREFIXES = ['/api/health', '/health', '/api/metrics', '/metrics', '/api/docs', '/docs'];

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duracao das requisicoes HTTP em segundos',
  labelNames: ['method', 'route', 'status', 'status_class'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});

const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total de requisicoes HTTP',
  labelNames: ['method', 'route', 'status', 'status_class'],
});

@Injectable()
export class HttpMetricsMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const path = (request.originalUrl ?? request.url ?? request.path).split('?')[0];
    if (SKIP_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))) {
      next();
      return;
    }

    const started = process.hrtime.bigint();
    let recorded = false;

    const recordOnce = () => {
      if (recorded) return;
      recorded = true;
      this.record(request, response.statusCode || 500, started);
    };

    response.once('finish', recordOnce);
    response.once('close', () => {
      if (!response.writableFinished) {
        recordOnce();
      }
    });

    next();
  }

  private record(request: Request, status: number, started: bigint): void {
    const route = this.normalizeRoute(request);
    const labels = {
      method: request.method,
      route,
      status: String(status),
      status_class: this.statusClass(status),
    };

    const elapsedSeconds = Number(process.hrtime.bigint() - started) / 1e9;
    httpRequestDuration.observe(labels, elapsedSeconds);
    httpRequestsTotal.inc(labels);
  }

  private normalizeRoute(request: Request): string {
    const template = request.route?.path;
    if (typeof template === 'string' && template.length > 0) {
      const withPrefix = template.startsWith('/api')
        ? template
        : `/api${template.startsWith('/') ? template : `/${template}`}`;
      return withPrefix.split('?')[0];
    }

    const path = request.path.split('?')[0];

    return path
      .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
      .replace(/\/\d+/g, '/:id');
  }

  private statusClass(status: number): string {
    if (status >= 100 && status <= 599) {
      return `${Math.floor(status / 100)}xx`;
    }

    return 'unknown';
  }
}
