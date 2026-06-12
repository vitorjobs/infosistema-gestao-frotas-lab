import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../src/auth/auth.module';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { Brand } from '../src/marcas/entities/marca.entity';
import { BrandsModule } from '../src/marcas/marcas.module';
import { CacheModule } from '../src/cache/cache.module';
import { GlobalExceptionFilter } from '../src/common/http-exception.filter';
import { validateEnv } from '../src/config/env.validation';
import { FleetModel } from '../src/modelos/entities/modelo.entity';
import { ModelsModule } from '../src/modelos/modelos.module';
import { User } from '../src/usuarios/entities/usuario.entity';
import { UsersModule } from '../src/usuarios/usuarios.module';
import { Vehicle } from '../src/veiculos/entities/veiculo.entity';
import { VehiclesModule } from '../src/veiculos/veiculos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    TypeOrmModule.forRoot({
      type: 'sqljs',
      autoSave: true,
      location: 'fleet-test-db',
      dropSchema: true,
      entities: [Brand, FleetModel, User, Vehicle],
      synchronize: true,
      logging: false,
    }),
    CacheModule,
    AuthModule,
    UsersModule,
    BrandsModule,
    ModelsModule,
    VehiclesModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class TestAppModule {}
