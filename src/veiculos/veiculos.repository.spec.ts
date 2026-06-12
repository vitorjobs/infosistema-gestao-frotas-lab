import { DataSource } from 'typeorm';
import { Brand } from '../marcas/entities/marca.entity';
import { FleetModel } from '../modelos/entities/modelo.entity';
import { Vehicle } from './entities/veiculo.entity';
import { VehiclesRepository } from './veiculos.repository';

describe('VehiclesRepository (integration)', () => {
  let dataSource: DataSource;
  let repo: VehiclesRepository;
  let model: FleetModel;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'sqljs',
      dropSchema: true,
      entities: [Brand, FleetModel, Vehicle],
      synchronize: true,
      logging: false,
    });
    await dataSource.initialize();
    model = await dataSource.getRepository(FleetModel).save({
      name: 'Repository Test Model',
      created_by: 'ci',
    });
    const repository = dataSource.getRepository(Vehicle);
    repo = new VehiclesRepository(repository as any);
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) await dataSource.destroy();
  });

  it('should create and find a vehicle', async () => {
    const dto = {
      license_plate: `TST${Math.floor(Math.random() * 10000)}`,
      chassis: `CHASSIS${Math.floor(Math.random() * 100000)}`,
      renavam: `REN${Math.floor(Math.random() * 100000)}`,
      year: 2024,
      model_id: model.id,
      created_by: 'ci',
    } as any;
    const created = await repo.create(dto);
    expect(created).toHaveProperty('id');
    const found = await repo.findById(created.id);
    expect(found).not.toBeNull();
    expect(found!.license_plate).toEqual(dto.license_plate);
    expect(found!.model.id).toEqual(model.id);
  });

  it('should update a vehicle', async () => {
    const dto = {
      license_plate: `UPD${Math.floor(Math.random() * 10000)}`,
      chassis: `UPDCH${Math.floor(Math.random() * 100000)}`,
      renavam: `UPDREN${Math.floor(Math.random() * 100000)}`,
      year: 2022,
      model_id: model.id,
      created_by: 'ci',
    } as any;
    const created = await repo.create(dto);
    const updated = await repo.update(created.id, { year: 2025 } as any);
    expect(updated.year).toEqual(2025);
  });

  it('should remove a vehicle', async () => {
    const dto = {
      license_plate: `DEL${Math.floor(Math.random() * 10000)}`,
      chassis: `DELCH${Math.floor(Math.random() * 100000)}`,
      renavam: `DELREN${Math.floor(Math.random() * 100000)}`,
      year: 2021,
      model_id: model.id,
      created_by: 'ci',
    } as any;
    const created = await repo.create(dto);
    await repo.remove(created.id);
    const found = await repo.findById(created.id);
    expect(found).toBeNull();
  });
});
