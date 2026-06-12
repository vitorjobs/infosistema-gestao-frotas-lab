import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MODELS_REPOSITORY } from '../common/constants';
import { FleetModel } from './entities/modelo.entity';
import { ModelsController } from './modelos.controller';
import { ModelsRepository } from './modelos.repository';
import { ModelsService } from './modelos.service';

@Module({
  imports: [TypeOrmModule.forFeature([FleetModel])],
  controllers: [ModelsController],
  providers: [
    ModelsService,
    {
      provide: MODELS_REPOSITORY,
      useClass: ModelsRepository,
    },
  ],
  exports: [ModelsService, MODELS_REPOSITORY],
})
export class ModelsModule {}
