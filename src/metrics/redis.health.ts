import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { CACHE_SERVICE } from '../common/constants';
import { ICacheService } from '../cache/cache.interface';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(@Inject(CACHE_SERVICE) private readonly cache: ICacheService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const isHealthy = await this.cache.ping();
    const result = this.getStatus(key, isHealthy);

    if (isHealthy) return result;
    throw new HealthCheckError('Falha no health check do Redis', result);
  }
}
