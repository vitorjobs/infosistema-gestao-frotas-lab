import { PaginatedResult } from '../common/pagination';
import { CreateModelDto } from './dto/criar-modelo.dto';
import { UpdateModelDto } from './dto/atualizar-modelo.dto';
import { FleetModel } from './entities/modelo.entity';

export interface IModelsRepository {
  create(dto: CreateModelDto & { created_by: string }): Promise<FleetModel>;
  findAll(page: number, limit: number): Promise<PaginatedResult<FleetModel>>;
  findById(id: number): Promise<FleetModel | null>;
  findByName(name: string): Promise<FleetModel | null>;
  brandExists(brandId: number): Promise<boolean>;
  countVehicles(modelId: number): Promise<number>;
  update(id: number, dto: UpdateModelDto): Promise<FleetModel>;
  remove(id: number): Promise<void>;
}
