import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { toPaginatedResult } from '../common/pagination';
import { CreateVehicleDto } from './dto/criar-veiculo.dto';
import { UpdateVehicleDto } from './dto/atualizar-veiculo.dto';
import { Vehicle } from './entities/veiculo.entity';
import { IVehiclesRepository } from './veiculos.repository.interface';

@Injectable()
export class VehiclesRepository implements IVehiclesRepository {
  constructor(
    @InjectRepository(Vehicle)
    private readonly repo: Repository<Vehicle>,
  ) {}

  async create(dto: CreateVehicleDto & { created_by: string }): Promise<Vehicle> {
    const entity = this.repo.create(dto as unknown as Partial<Vehicle>);
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

  async findById(id: number): Promise<Vehicle | null> {
    return this.repo.findOneBy({ id });
  }

  async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    return this.repo.findOneBy({ license_plate: licensePlate });
  }

  async update(id: number, dto: UpdateVehicleDto): Promise<Vehicle> {
    await this.repo.update(id, dto as unknown as Partial<Vehicle>);
    const updated = await this.findById(id);
    if (!updated) throw new NotFoundException(`Veiculo com id ${id} nao encontrado apos atualizacao`);
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
