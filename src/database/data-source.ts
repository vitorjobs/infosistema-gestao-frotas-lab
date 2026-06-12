import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Brand } from '../marcas/entities/marca.entity';
import { FleetModel } from '../modelos/entities/modelo.entity';
import { User } from '../usuarios/entities/usuario.entity';
import { Vehicle } from '../veiculos/entities/veiculo.entity';
import { AddCreatedByToUsers2026061002000 } from './migrations/2026061002000-AddCreatedByToUsers';
import { CreateModelsAndVehicles2026061000000 } from './migrations/2026061000000-CreateModelsAndVehicles';
import { CreateUsersAndBrands2026061001000 } from './migrations/2026061001000-CreateUsersAndBrands';
import { RenameTablesToPortuguese2026061100000 } from './migrations/2026061100000-RenameTablesToPortuguese';

function databasePort(): number {
  const value = Number.parseInt(process.env.DATABASE_PORT || '1433', 10);
  return Number.isFinite(value) ? value : 1433;
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'mssql',
  host: process.env.DATABASE_HOST || 'localhost',
  port: databasePort(),
  username: process.env.DATABASE_USER || 'SA',
  password: process.env.DATABASE_PASSWORD || 'YourStrong@Password',
  database: process.env.DATABASE_NAME || 'gestao_frotas_api',
  entities: [Brand, FleetModel, User, Vehicle],
  migrations: [
    CreateModelsAndVehicles2026061000000,
    CreateUsersAndBrands2026061001000,
    AddCreatedByToUsers2026061002000,
    RenameTablesToPortuguese2026061100000,
  ],
  synchronize: false,
  logging: process.env.TYPEORM_LOGGING === 'true',
  options: {
    encrypt: process.env.DATABASE_ENCRYPT === 'true',
    trustServerCertificate: process.env.DATABASE_TRUST_SERVER_CERTIFICATE !== 'false',
  },
};

export function createTypeOrmOptions(): TypeOrmModuleOptions {
  const retryAttempts = Number.parseInt(process.env.DATABASE_CONNECT_RETRIES || '10', 10);
  const retryDelay = Number.parseInt(process.env.DATABASE_CONNECT_RETRY_DELAY_MS || '3000', 10);

  return {
    ...dataSourceOptions,
    migrationsRun: process.env.TYPEORM_MIGRATIONS_RUN === 'true',
    retryAttempts: Number.isFinite(retryAttempts) ? retryAttempts : 10,
    retryDelay: Number.isFinite(retryDelay) ? retryDelay : 3000,
  };
}

export default new DataSource(dataSourceOptions);
