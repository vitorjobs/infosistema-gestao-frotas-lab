import * as fs from 'node:fs';
import * as path from 'node:path';
import { Brand } from '../marcas/entities/marca.entity';
import { FleetModel } from '../modelos/entities/modelo.entity';
import { Vehicle } from '../veiculos/entities/veiculo.entity';
import dataSource from './data-source';

type SeedBrand = { name: string };
type SeedModel = { name: string; brand?: string };
type SeedVehicle = {
  license_plate: string;
  chassis: string;
  renavam: string;
  year: number;
  model: string;
};

type SeedFile = {
  brands?: SeedBrand[];
  models?: SeedModel[];
  vehicles?: SeedVehicle[];
};

async function seed() {
  const seedPath = path.resolve(process.cwd(), 'seed_vehicles.json');
  const raw = fs.readFileSync(seedPath, 'utf8');
  const payload = JSON.parse(raw) as SeedFile;
  const createdBy = process.env.DEFAULT_CREATED_BY || 'aivacol';

  await dataSource.initialize();

  const brandRepo = dataSource.getRepository(Brand);
  const modelRepo = dataSource.getRepository(FleetModel);
  const vehicleRepo = dataSource.getRepository(Vehicle);

  const brandByName = new Map<string, Brand>();

  for (const item of payload.brands ?? []) {
    let brand = await brandRepo.findOneBy({ name: item.name });
    if (!brand) {
      brand = await brandRepo.save({ name: item.name, created_by: createdBy });
    }
    brandByName.set(item.name, brand);
  }

  const modelByName = new Map<string, FleetModel>();

  for (const item of payload.models ?? []) {
    let model = await modelRepo.findOneBy({ name: item.name });
    if (!model) {
      model = await modelRepo.save({
        name: item.name,
        brand_id: item.brand ? brandByName.get(item.brand)?.id ?? null : null,
        created_by: createdBy,
      });
    }
    modelByName.set(item.name, model);
  }

  for (const item of payload.vehicles ?? []) {
    const model = modelByName.get(item.model);
    if (!model) {
      throw new Error(`Modelo '${item.model}' nao encontrado para seed de veiculo`);
    }

    const exists = await vehicleRepo.findOneBy({ license_plate: item.license_plate.toUpperCase() });
    if (exists) continue;

    await vehicleRepo.save({
      license_plate: item.license_plate.toUpperCase(),
      chassis: item.chassis.toUpperCase(),
      renavam: item.renavam,
      year: item.year,
      model_id: model.id,
      created_by: createdBy,
    });
  }

  await dataSource.destroy();
  console.log('Seed concluido com sucesso');
}

seed().catch((error) => {
  console.error('Seed falhou', error);
  process.exit(1);
});
