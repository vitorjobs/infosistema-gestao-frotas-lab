import { HealthCheckError } from '@nestjs/terminus';
import { AuditService } from '../audit/audit.service';
import { MongoHealthIndicator } from './mongo.health';

describe('MongoHealthIndicator', () => {
  const createAuditService = (enabled: boolean, pingResult: boolean) =>
    ({
      isEnabled: jest.fn(() => enabled),
      ping: jest.fn().mockResolvedValue(pingResult),
    }) as unknown as jest.Mocked<Pick<AuditService, 'isEnabled' | 'ping'>>;

  it('retorna up quando auditoria esta desabilitada', async () => {
    const auditService = createAuditService(false, false);
    const indicator = new MongoHealthIndicator(auditService as unknown as AuditService);

    await expect(indicator.isHealthy('mongodb')).resolves.toEqual({
      mongodb: {
        status: 'up',
        message: 'Auditoria desabilitada',
      },
    });
    expect(auditService.ping).not.toHaveBeenCalled();
  });

  it('retorna up quando MongoDB responde ping', async () => {
    const auditService = createAuditService(true, true);
    const indicator = new MongoHealthIndicator(auditService as unknown as AuditService);

    await expect(indicator.isHealthy('mongodb')).resolves.toEqual({
      mongodb: {
        status: 'up',
      },
    });
  });

  it('retorna erro controlado quando MongoDB falha', async () => {
    const auditService = createAuditService(true, false);
    const indicator = new MongoHealthIndicator(auditService as unknown as AuditService);

    await expect(indicator.isHealthy('mongodb')).rejects.toBeInstanceOf(HealthCheckError);
  });
});
