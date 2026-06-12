import { Controller, Get, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { register } from 'prom-client';
import { Response } from 'express';
import { Public } from '../auth/decorators/publico.decorator';

@Public()
@ApiTags('metrics')
@Controller('metrics')
export class PrometheusController {
  @Get()
  @ApiOperation({
    summary: 'Metricas Prometheus',
    description: 'Expoe metricas em formato Prometheus text/plain. Esta rota nao exige JWT.',
  })
  @ApiProduces('text/plain')
  @ApiOkResponse({
    description: 'Metricas Prometheus.',
    schema: {
      type: 'string',
      example: '# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds.',
    },
  })
  async index(@Res() res: Response) {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  }
}
