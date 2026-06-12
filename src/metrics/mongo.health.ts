import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class MongoHealthIndicator extends HealthIndicator {
  constructor(private readonly auditService: AuditService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    if (!this.auditService.isEnabled()) {
      return this.getStatus(key, true, { message: 'Auditoria desabilitada' });
    }

    const isHealthy = await this.auditService.ping();
    if (!isHealthy) {
      throw new HealthCheckError('Falha no health check da auditoria MongoDB', this.getStatus(key, false));
    }

    return this.getStatus(key, true);
  }
}
