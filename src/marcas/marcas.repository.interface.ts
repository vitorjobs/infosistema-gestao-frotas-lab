import { PaginatedResult } from '../common/pagination';
import { CreateBrandDto } from './dto/criar-marca.dto';
import { UpdateBrandDto } from './dto/atualizar-marca.dto';
import { Brand } from './entities/marca.entity';

export interface IBrandsRepository {
  create(dto: CreateBrandDto & { created_by: string }): Promise<Brand>;
  findAll(page: number, limit: number): Promise<PaginatedResult<Brand>>;
  findById(id: number): Promise<Brand | null>;
  findByName(name: string): Promise<Brand | null>;
  countModels(brandId: number): Promise<number>;
  update(id: number, dto: UpdateBrandDto): Promise<Brand>;
  remove(id: number): Promise<void>;
}
