import { Injectable, Optional } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { DataSource } from 'typeorm';
import { isDatabaseEnabled } from '../config/database-enabled';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(@Optional() private readonly dataSource?: DataSource) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    if (!isDatabaseEnabled()) {
      return this.getStatus(key, true, { message: 'Banco de dados desabilitado' });
    }

    if (!this.dataSource?.isInitialized) {
      const result = this.getStatus(key, false, { message: 'DataSource indisponivel' });
      throw new HealthCheckError('Falha no health check do SQL Server', result);
    }

    try {
      await this.dataSource.query('SELECT 1');
      return this.getStatus(key, true);
    } catch {
      const result = this.getStatus(key, false);
      throw new HealthCheckError('Falha no health check do SQL Server', result);
    }
  }
}
