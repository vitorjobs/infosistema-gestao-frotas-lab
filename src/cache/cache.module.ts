import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_SERVICE } from '../common/constants';
import { MemoryCacheService } from './memory-cache.service';
import { RedisCacheService } from './redis-cache.service';

@Global()
@Module({
  providers: [
    {
      provide: CACHE_SERVICE,
      useFactory: (config: ConfigService) => {
        if (
          config.get<string>('REDIS_ENABLED') === 'false' ||
          config.get<string>('USE_MEMORY_CACHE') === 'true'
        ) {
          return new MemoryCacheService();
        }
        return new RedisCacheService(config);
      },
      inject: [ConfigService],
    },
  ],
  exports: [CACHE_SERVICE],
})
export class CacheModule {}
