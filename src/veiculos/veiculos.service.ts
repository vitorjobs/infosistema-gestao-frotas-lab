import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ICacheService } from '../cache/cache.interface';
import { CACHE_SERVICE, MODELS_REPOSITORY, VEHICLES_REPOSITORY } from '../common/constants';
import { PaginatedResult } from '../common/pagination';
import { getCacheTtlSeconds, resolveCreatedByFromConfig } from '../common/request-metadata';
import { IModelsRepository } from '../modelos/modelos.repository.interface';
import { CreateVehicleDto } from './dto/criar-veiculo.dto';
import { UpdateVehicleDto } from './dto/atualizar-veiculo.dto';
import { Vehicle } from './entities/veiculo.entity';
import { IVehiclesRepository } from './veiculos.repository.interface';

const VEHICLE_CACHE_PREFIX = 'vehicle:';
const VEHICLES_LIST_CACHE_PREFIX = 'vehicles:page:';

@Injectable()
export class VehiclesService {
  constructor(
    @Inject(VEHICLES_REPOSITORY)
    private readonly repo: IVehiclesRepository,
    @Inject(MODELS_REPOSITORY)
    private readonly modelsRepo: IModelsRepository,
    @Inject(CACHE_SERVICE)
    private readonly cache: ICacheService,
    private readonly config: ConfigService,
  ) {}

  private cacheKey(id: number) {
    return `${VEHICLE_CACHE_PREFIX}${id}`;
  }

  private listCacheKey(page: number, limit: number) {
    return `${VEHICLES_LIST_CACHE_PREFIX}${page}:${limit}`;
  }

  async create(dto: CreateVehicleDto, actor?: string): Promise<Vehicle> {
    await this.ensureModelExists(dto.model_id);

    const created = await this.repo.create({
      ...dto,
      created_by: resolveCreatedByFromConfig(this.config, dto.created_by, actor),
    });

    await this.invalidateVehicleCaches(created.id);
    return created;
  }

  async findAll(page: number, limit: number): Promise<PaginatedResult<Vehicle>> {
    const cacheKey = this.listCacheKey(page, limit);
    const cached = await this.cache.get<PaginatedResult<Vehicle>>(cacheKey);
    if (cached) return cached;

    const result = await this.repo.findAll(page, limit);
    await this.cache.set(cacheKey, result, getCacheTtlSeconds(this.config));
    return result;
  }

  async findById(id: number): Promise<Vehicle> {
    const key = this.cacheKey(id);
    const cached = await this.cache.get<Vehicle>(key);
    if (cached) return cached;

    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException(`Veiculo com id ${id} nao encontrado`);

    await this.cache.set(key, item, getCacheTtlSeconds(this.config));
    return item;
  }

  async update(id: number, dto: UpdateVehicleDto): Promise<Vehicle> {
    await this.findById(id);
    if (dto.model_id) await this.ensureModelExists(dto.model_id);

    const updated = await this.repo.update(id, dto);
    await this.invalidateVehicleCaches(id);
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.findById(id);
    await this.repo.remove(id);
    await this.invalidateVehicleCaches(id);
  }

  private async ensureModelExists(modelId: number): Promise<void> {
    const model = await this.modelsRepo.findById(modelId);
    if (!model) throw new NotFoundException(`Modelo com id ${modelId} nao encontrado`);
  }

  private async invalidateVehicleCaches(id?: number): Promise<void> {
    if (id) await this.cache.del(this.cacheKey(id));
    await this.cache.delByPrefix(VEHICLES_LIST_CACHE_PREFIX);
  }
}
