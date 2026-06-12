import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BRANDS_REPOSITORY } from '../common/constants';
import { BrandsController } from './marcas.controller';
import { BrandsRepository } from './marcas.repository';
import { BrandsService } from './marcas.service';
import { Brand } from './entities/marca.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Brand])],
  controllers: [BrandsController],
  providers: [
    BrandsService,
    {
      provide: BRANDS_REPOSITORY,
      useClass: BrandsRepository,
    },
  ],
  exports: [BrandsService, BRANDS_REPOSITORY],
})
export class BrandsModule {}
