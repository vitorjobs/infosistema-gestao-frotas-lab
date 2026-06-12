import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { toPaginatedResult } from '../common/pagination';
import { FleetModel } from '../modelos/entities/modelo.entity';
import { CreateBrandDto } from './dto/criar-marca.dto';
import { UpdateBrandDto } from './dto/atualizar-marca.dto';
import { Brand } from './entities/marca.entity';
import { IBrandsRepository } from './marcas.repository.interface';

@Injectable()
export class BrandsRepository implements IBrandsRepository {
  constructor(
    @InjectRepository(Brand)
    private readonly repo: Repository<Brand>,
  ) {}

  async create(dto: CreateBrandDto & { created_by: string }): Promise<Brand> {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findAll(page: number, limit: number) {
    const [items, total] = await this.repo.findAndCount({
      order: { id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return toPaginatedResult(items, total, page, limit);
  }

  async findById(id: number): Promise<Brand | null> {
    return this.repo.findOneBy({ id });
  }

  async findByName(name: string): Promise<Brand | null> {
    return this.repo.findOneBy({ name });
  }

  async countModels(brandId: number): Promise<number> {
    return this.repo.manager.getRepository(FleetModel).count({
      where: { brand_id: brandId },
    });
  }

  async update(id: number, dto: UpdateBrandDto): Promise<Brand> {
    await this.repo.update(id, dto);
    const updated = await this.findById(id);
    if (!updated) throw new NotFoundException(`Marca com id ${id} nao encontrada apos atualizacao`);
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
