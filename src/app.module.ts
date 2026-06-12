import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { BrandsModule } from './marcas/marcas.module';
import { CacheModule } from './cache/cache.module';
import { GlobalExceptionFilter } from './common/http-exception.filter';
import { isDatabaseEnabled } from './config/database-enabled';
import { validateEnv } from './config/env.validation';
import { createTypeOrmOptions } from './database/data-source';
import { MetricsModule } from './metrics/metrics.module';
import { ModelsModule } from './modelos/modelos.module';
import { UsersModule } from './usuarios/usuarios.module';
import { VehiclesModule } from './veiculos/veiculos.module';

const databaseEnabled = isDatabaseEnabled();
const databaseImports = databaseEnabled
  ? [
      TypeOrmModule.forRoot(createTypeOrmOptions()),
      AuthModule,
      UsersModule,
      BrandsModule,
      ModelsModule,
      VehiclesModule,
    ]
  : [];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    CacheModule,
    AuditModule,
    MetricsModule,
    ...databaseImports,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    ...(databaseEnabled
      ? [
          {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
          },
        ]
      : []),
  ],
})
export class AppModule {}
