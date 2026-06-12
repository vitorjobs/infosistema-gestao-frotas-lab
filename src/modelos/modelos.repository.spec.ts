import { DataSource } from 'typeorm';
import { Brand } from '../marcas/entities/marca.entity';
import { Vehicle } from '../veiculos/entities/veiculo.entity';
import { FleetModel } from './entities/modelo.entity';
import { ModelsRepository } from './modelos.repository';

describe('ModelsRepository (integration)', () => {
  let dataSource: DataSource;
  let repo: ModelsRepository;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'sqljs',
      dropSchema: true,
      entities: [Brand, FleetModel, Vehicle],
      synchronize: true,
      logging: false,
    });
    await dataSource.initialize();
    repo = new ModelsRepository(dataSource.getRepository(FleetModel) as any);
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) await dataSource.destroy();
  });

  it('creates, finds and updates a model', async () => {
    const created = await repo.create({ name: 'Sedan', created_by: 'ci' });
    expect(created).toHaveProperty('id');

    const found = await repo.findByName('Sedan');
    expect(found?.id).toEqual(created.id);

    const updated = await repo.update(created.id, { name: 'SUV' });
    expect(updated.name).toEqual('SUV');
  });

  it('counts vehicles that reference a model', async () => {
    const model = await repo.create({ name: 'Pickup', created_by: 'ci' });
    await dataSource.getRepository(Vehicle).save({
      license_plate: 'CNT1234',
      chassis: 'COUNTCHASSIS01',
      renavam: 'COUNTREN01',
      year: 2024,
      model_id: model.id,
      created_by: 'ci',
    });

    await expect(repo.countVehicles(model.id)).resolves.toBe(1);
  });

  it('removes a model', async () => {
    const model = await repo.create({ name: 'Hatch', created_by: 'ci' });
    await repo.remove(model.id);

    await expect(repo.findById(model.id)).resolves.toBeNull();
  });
});
