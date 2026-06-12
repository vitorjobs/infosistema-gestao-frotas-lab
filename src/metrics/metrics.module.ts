import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { collectDefaultMetrics, register } from 'prom-client';
import { AuditModule } from '../audit/audit.module';
import { DatabaseHealthIndicator } from './database.health';
import { HealthController } from './health.controller';
import { HttpMetricsMiddleware } from './http-metrics.middleware';
import { MongoHealthIndicator } from './mongo.health';
import { PrometheusController } from './prometheus.controller';
import { RedisHealthIndicator } from './redis.health';

function ensureDefaultNodeMetrics(): void {
  if (register.getSingleMetric('process_cpu_seconds_total')) return;

  collectDefaultMetrics({
    register,
    eventLoopMonitoringPrecision: 10,
    gcDurationBuckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  });
}

@Module({
  imports: [TerminusModule, AuditModule],
  controllers: [PrometheusController, HealthController],
  providers: [
    DatabaseHealthIndicator,
    RedisHealthIndicator,
    MongoHealthIndicator,
    HttpMetricsMiddleware,
  ],
})
export class MetricsModule implements NestModule {
  constructor() {
    ensureDefaultNodeMetrics();
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpMetricsMiddleware).forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
