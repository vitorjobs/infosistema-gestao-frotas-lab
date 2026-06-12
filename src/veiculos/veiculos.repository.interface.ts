import { PaginatedResult } from '../common/pagination';
import { CreateVehicleDto } from './dto/criar-veiculo.dto';
import { UpdateVehicleDto } from './dto/atualizar-veiculo.dto';
import { Vehicle } from './entities/veiculo.entity';

export interface IVehiclesRepository {
  create(dto: CreateVehicleDto & { created_by: string }): Promise<Vehicle>;
  findAll(page: number, limit: number): Promise<PaginatedResult<Vehicle>>;
  findById(id: number): Promise<Vehicle | null>;
  findByLicensePlate(licensePlate: string): Promise<Vehicle | null>;
  update(id: number, dto: UpdateVehicleDto): Promise<Vehicle>;
  remove(id: number): Promise<void>;
}
