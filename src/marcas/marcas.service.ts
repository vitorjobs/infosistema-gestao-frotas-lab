import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ICacheService } from '../cache/cache.interface';
import { BRANDS_REPOSITORY, CACHE_SERVICE } from '../common/constants';
import { PaginatedResult } from '../common/pagination';
import { getCacheTtlSeconds, resolveCreatedByFromConfig } from '../common/request-metadata';
import { IBrandsRepository } from './marcas.repository.interface';
import { CreateBrandDto } from './dto/criar-marca.dto';
import { UpdateBrandDto } from './dto/atualizar-marca.dto';
import { Brand } from './entities/marca.entity';

const BRANDS_LIST_CACHE_PREFIX = 'brands:page:';

@Injectable()
export class BrandsService {
  constructor(
    @Inject(BRANDS_REPOSITORY)
    private readonly repo: IBrandsRepository,
    @Inject(CACHE_SERVICE)
    private readonly cache: ICacheService,
    private readonly config: ConfigService,
  ) {}

  private listCacheKey(page: number, limit: number): string {
    return `${BRANDS_LIST_CACHE_PREFIX}${page}:${limit}`;
  }

  async create(dto: CreateBrandDto, actor?: string): Promise<Brand> {
    const existing = await this.repo.findByName(dto.name);
    if (existing) {
      throw new ConflictException({
        error: 'UniqueConstraintViolation',
        message: `Marca '${dto.name}' ja existe`,
      });
    }

    const created = await this.repo.create({
      name: dto.name,
      created_by: resolveCreatedByFromConfig(this.config, dto.created_by, actor),
    });

    await this.invalidateListCache();
    return created;
  }

  async findAll(page: number, limit: number): Promise<PaginatedResult<Brand>> {
    const cacheKey = this.listCacheKey(page, limit);
    const cached = await this.cache.get<PaginatedResult<Brand>>(cacheKey);
    if (cached) return cached;

    const result = await this.repo.findAll(page, limit);
    await this.cache.set(cacheKey, result, getCacheTtlSeconds(this.config));
    return result;
  }

  async findById(id: number): Promise<Brand> {
    const brand = await this.repo.findById(id);
    if (!brand) throw new NotFoundException(`Marca com id ${id} nao encontrada`);
    return brand;
  }

  async update(id: number, dto: UpdateBrandDto): Promise<Brand> {
    await this.findById(id);

    if (dto.name) {
      const brandWithName = await this.repo.findByName(dto.name);
      if (brandWithName && brandWithName.id !== id) {
        throw new ConflictException({
          error: 'UniqueConstraintViolation',
          message: `Marca '${dto.name}' ja existe`,
        });
      }
    }

    const updated = await this.repo.update(id, dto);
    await this.invalidateListCache();
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.findById(id);

    const modelCount = await this.repo.countModels(id);
    if (modelCount > 0) {
      throw new ConflictException('Marca nao pode ser removida enquanto houver modelos vinculados');
    }

    await this.repo.remove(id);
    await this.invalidateListCache();
  }

  private async invalidateListCache(): Promise<void> {
    await this.cache.delByPrefix(BRANDS_LIST_CACHE_PREFIX);
  }
}
