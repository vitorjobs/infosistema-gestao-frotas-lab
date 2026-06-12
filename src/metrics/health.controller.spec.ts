import { HealthCheckService } from '@nestjs/terminus';
import { DatabaseHealthIndicator } from './database.health';
import { HealthController } from './health.controller';
import { MongoHealthIndicator } from './mongo.health';
import { RedisHealthIndicator } from './redis.health';

describe('HealthController', () => {
  it('delegates checks to database, redis and mongodb indicators', () => {
    const health = { check: jest.fn((checks: Array<() => unknown>) => checks.map((check) => check())) };
    const db = { isHealthy: jest.fn(() => ({ database: { status: 'up' } })) };
    const redis = { isHealthy: jest.fn(() => ({ redis: { status: 'up' } })) };
    const mongo = { isHealthy: jest.fn(() => ({ mongodb: { status: 'up' } })) };
    const controller = new HealthController(
      health as unknown as HealthCheckService,
      db as unknown as DatabaseHealthIndicator,
      redis as unknown as RedisHealthIndicator,
      mongo as unknown as MongoHealthIndicator,
    );

    expect(controller.check()).toEqual([
      { database: { status: 'up' } },
      { redis: { status: 'up' } },
      { mongodb: { status: 'up' } },
    ]);
    expect(health.check).toHaveBeenCalledTimes(1);
    expect(db.isHealthy).toHaveBeenCalledWith('database');
    expect(redis.isHealthy).toHaveBeenCalledWith('redis');
    expect(mongo.isHealthy).toHaveBeenCalledWith('mongodb');
  });
});
