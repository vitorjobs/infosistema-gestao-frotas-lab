import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { toPaginatedResult } from '../common/pagination';
import { Brand } from '../marcas/entities/marca.entity';
import { Vehicle } from '../veiculos/entities/veiculo.entity';
import { CreateModelDto } from './dto/criar-modelo.dto';
import { UpdateModelDto } from './dto/atualizar-modelo.dto';
import { FleetModel } from './entities/modelo.entity';
import { IModelsRepository } from './modelos.repository.interface';

@Injectable()
export class ModelsRepository implements IModelsRepository {
  constructor(
    @InjectRepository(FleetModel)
    private readonly repo: Repository<FleetModel>,
  ) {}

  async create(dto: CreateModelDto & { created_by: string }): Promise<FleetModel> {
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

  async findById(id: number): Promise<FleetModel | null> {
    return this.repo.findOneBy({ id });
  }

  async findByName(name: string): Promise<FleetModel | null> {
    return this.repo.findOneBy({ name });
  }

  async brandExists(brandId: number): Promise<boolean> {
    return this.repo.manager.getRepository(Brand).exists({
      where: { id: brandId },
    });
  }

  async countVehicles(modelId: number): Promise<number> {
    return this.repo.manager.getRepository(Vehicle).count({
      where: { model_id: modelId },
    });
  }

  async update(id: number, dto: UpdateModelDto): Promise<FleetModel> {
    await this.repo.update(id, dto);
    const updated = await this.findById(id);
    if (!updated) throw new NotFoundException(`Modelo com id ${id} nao encontrado apos atualizacao`);
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
