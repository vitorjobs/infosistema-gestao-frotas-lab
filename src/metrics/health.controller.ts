import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { Public } from '../auth/decorators/publico.decorator';
import { DatabaseHealthIndicator } from './database.health';
import { MongoHealthIndicator } from './mongo.health';
import { RedisHealthIndicator } from './redis.health';

@Public()
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: DatabaseHealthIndicator,
    private readonly redis: RedisHealthIndicator,
    private readonly mongo: MongoHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Health check publico',
    description:
      'Verifica dependencias reais da aplicacao: SQL Server (`database`), Redis (`redis`) e MongoDB de auditoria (`mongodb`, quando habilitado). Retorna 200 quando saudavel ou 503 quando alguma dependencia falhar. Nao exige JWT.',
  })
  @ApiOkResponse({
    description: 'Aplicacao saudavel.',
    schema: {
      example: {
        status: 'ok',
        info: {
          database: { status: 'up' },
          redis: { status: 'up' },
          mongodb: { status: 'up' },
        },
        error: {},
        details: {
          database: { status: 'up' },
          redis: { status: 'up' },
          mongodb: { status: 'up' },
        },
      },
    },
  })
  @ApiServiceUnavailableResponse({
    description: 'Alguma dependencia do health check falhou.',
  })
  check() {
    return this.health.check([
      () => this.db.isHealthy('database'),
      () => this.redis.isHealthy('redis'),
      () => this.mongo.isHealthy('mongodb'),
    ]);
  }
}
