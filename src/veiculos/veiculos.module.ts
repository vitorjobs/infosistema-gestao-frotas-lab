import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VEHICLES_REPOSITORY } from '../common/constants';
import { ModelsModule } from '../modelos/modelos.module';
import { Vehicle } from './entities/veiculo.entity';
import { VehiclesController } from './veiculos.controller';
import { VehiclesRepository } from './veiculos.repository';
import { VehiclesService } from './veiculos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle]), ModelsModule],
  controllers: [VehiclesController],
  providers: [
    VehiclesService,
    {
      provide: VEHICLES_REPOSITORY,
      useClass: VehiclesRepository,
    },
  ],
  exports: [VehiclesService],
})
export class VehiclesModule {}
