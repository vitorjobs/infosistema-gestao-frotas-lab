import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ICacheService } from '../cache/cache.interface';
import { CACHE_SERVICE, MODELS_REPOSITORY } from '../common/constants';
import { PaginatedResult } from '../common/pagination';
import { getCacheTtlSeconds, resolveCreatedByFromConfig } from '../common/request-metadata';
import { CreateModelDto } from './dto/criar-modelo.dto';
import { UpdateModelDto } from './dto/atualizar-modelo.dto';
import { FleetModel } from './entities/modelo.entity';
import { IModelsRepository } from './modelos.repository.interface';

const MODELS_LIST_CACHE_PREFIX = 'models:page:';

@Injectable()
export class ModelsService {
  constructor(
    @Inject(MODELS_REPOSITORY)
    private readonly repo: IModelsRepository,
    @Inject(CACHE_SERVICE)
    private readonly cache: ICacheService,
    private readonly config: ConfigService,
  ) {}

  private listCacheKey(page: number, limit: number): string {
    return `${MODELS_LIST_CACHE_PREFIX}${page}:${limit}`;
  }

  async create(dto: CreateModelDto, actor?: string): Promise<FleetModel> {
    const existing = await this.repo.findByName(dto.name);
    if (existing) {
      throw new ConflictException({
        error: 'UniqueConstraintViolation',
        message: `Modelo '${dto.name}' ja existe`,
      });
    }
    if (dto.brand_id) await this.ensureBrandExists(dto.brand_id);

    const created = await this.repo.create({
      name: dto.name,
      brand_id: dto.brand_id,
      created_by: resolveCreatedByFromConfig(this.config, dto.created_by, actor),
    });

    await this.invalidateListCache();
    return created;
  }

  async findAll(page: number, limit: number): Promise<PaginatedResult<FleetModel>> {
    const cacheKey = this.listCacheKey(page, limit);
    const cached = await this.cache.get<PaginatedResult<FleetModel>>(cacheKey);
    if (cached) return cached;

    const result = await this.repo.findAll(page, limit);
    await this.cache.set(cacheKey, result, getCacheTtlSeconds(this.config));
    return result;
  }

  async findById(id: number): Promise<FleetModel> {
    const model = await this.repo.findById(id);
    if (!model) throw new NotFoundException(`Modelo com id ${id} nao encontrado`);
    return model;
  }

  async update(id: number, dto: UpdateModelDto): Promise<FleetModel> {
    await this.findById(id);

    if (dto.name) {
      const modelWithName = await this.repo.findByName(dto.name);
      if (modelWithName && modelWithName.id !== id) {
        throw new ConflictException({
          error: 'UniqueConstraintViolation',
          message: `Modelo '${dto.name}' ja existe`,
        });
      }
    }

    if (dto.brand_id) await this.ensureBrandExists(dto.brand_id);

    const updated = await this.repo.update(id, dto);
    await this.invalidateListCache();
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.findById(id);

    const vehicleCount = await this.repo.countVehicles(id);
    if (vehicleCount > 0) {
      throw new ConflictException('Modelo nao pode ser removido enquanto houver veiculos vinculados');
    }

    await this.repo.remove(id);
    await this.invalidateListCache();
  }

  private async ensureBrandExists(brandId: number): Promise<void> {
    const exists = await this.repo.brandExists(brandId);
    if (!exists) throw new NotFoundException(`Marca com id ${brandId} nao encontrada`);
  }

  private async invalidateListCache(): Promise<void> {
    await this.cache.delByPrefix(MODELS_LIST_CACHE_PREFIX);
  }
}
