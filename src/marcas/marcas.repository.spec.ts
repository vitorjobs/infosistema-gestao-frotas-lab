import { DataSource } from 'typeorm';
import { FleetModel } from '../modelos/entities/modelo.entity';
import { Vehicle } from '../veiculos/entities/veiculo.entity';
import { BrandsRepository } from './marcas.repository';
import { Brand } from './entities/marca.entity';

describe('BrandsRepository (integration)', () => {
  let dataSource: DataSource;
  let repo: BrandsRepository;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'sqljs',
      dropSchema: true,
      entities: [Brand, FleetModel, Vehicle],
      synchronize: true,
      logging: false,
    });
    await dataSource.initialize();
    repo = new BrandsRepository(dataSource.getRepository(Brand) as any);
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) await dataSource.destroy();
  });

  it('creates, finds and updates a brand', async () => {
    const created = await repo.create({ name: 'Volkswagen', created_by: 'ci' });
    expect(created).toHaveProperty('id');

    const found = await repo.findByName('Volkswagen');
    expect(found?.id).toEqual(created.id);

    const updated = await repo.update(created.id, { name: 'VW' });
    expect(updated.name).toEqual('VW');
  });

  it('counts models that reference a brand', async () => {
    const brand = await repo.create({ name: 'Chevrolet', created_by: 'ci' });
    await dataSource.getRepository(FleetModel).save({
      name: 'Onix',
      brand_id: brand.id,
      created_by: 'ci',
    });

    await expect(repo.countModels(brand.id)).resolves.toBe(1);
  });

  it('removes a brand', async () => {
    const brand = await repo.create({ name: 'Renault', created_by: 'ci' });
    await repo.remove(brand.id);

    await expect(repo.findById(brand.id)).resolves.toBeNull();
  });
});
