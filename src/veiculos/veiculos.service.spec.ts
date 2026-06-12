import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CACHE_SERVICE, MODELS_REPOSITORY, VEHICLES_REPOSITORY } from '../common/constants';
import { VehiclesService } from './veiculos.service';

const mockRepo = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findByLicensePlate: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

const mockModelsRepo = () => ({
  findById: jest.fn(),
});

const mockCache = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  delByPrefix: jest.fn(),
  ping: jest.fn(),
});

const mockConfig = () => ({
  get: jest.fn((key: string, defaultValue?: unknown) => {
    if (key === 'DEFAULT_CREATED_BY') return 'aivacol';
    if (key === 'REDIS_TTL') return 3600;
    return defaultValue;
  }),
});

describe('VehiclesService', () => {
  let service: VehiclesService;
  let repo: ReturnType<typeof mockRepo>;
  let modelsRepo: ReturnType<typeof mockModelsRepo>;
  let cache: ReturnType<typeof mockCache>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        { provide: VEHICLES_REPOSITORY, useFactory: mockRepo },
        { provide: MODELS_REPOSITORY, useFactory: mockModelsRepo },
        { provide: CACHE_SERVICE, useFactory: mockCache },
        { provide: ConfigService, useFactory: mockConfig },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
    repo = module.get(VEHICLES_REPOSITORY);
    modelsRepo = module.get(MODELS_REPOSITORY);
    cache = module.get(CACHE_SERVICE);
    modelsRepo.findById.mockResolvedValue({ id: 1, name: 'Truck' });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a vehicle and invalidates list cache', async () => {
      const dto = {
        license_plate: 'ABC1234',
        chassis: '9BWZZZ377VT004251',
        renavam: '12345678901',
        year: 2024,
        model_id: 1,
      } as any;
      repo.create.mockResolvedValue({ id: 1, ...dto, created_by: 'aivacol' });
      await expect(service.create(dto)).resolves.toEqual({ id: 1, ...dto, created_by: 'aivacol' });
      expect(modelsRepo.findById).toHaveBeenCalledWith(1);
      expect(repo.create).toHaveBeenCalledWith({ ...dto, created_by: 'aivacol' });
      expect(cache.del).toHaveBeenCalledWith('vehicle:1');
      expect(cache.delByPrefix).toHaveBeenCalledWith('vehicles:page:');
    });
  });

  describe('findAll', () => {
    it('returns cached items when present', async () => {
      const cached = { data: [{ id: 1 }], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } };
      cache.get.mockResolvedValue(cached);
      await expect(service.findAll(1, 20)).resolves.toEqual(cached);
      expect(cache.get).toHaveBeenCalledWith('vehicles:page:1:20');
    });

    it('queries repo and caches when no cache', async () => {
      cache.get.mockResolvedValue(null);
      const paginated = {
        data: [{ id: 2 }],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };
      repo.findAll.mockResolvedValue(paginated);
      await expect(service.findAll(1, 20)).resolves.toEqual(paginated);
      expect(repo.findAll).toHaveBeenCalledWith(1, 20);
      expect(cache.set).toHaveBeenCalledWith('vehicles:page:1:20', paginated, 3600);
    });
  });

  describe('findById', () => {
    it('throws when not found', async () => {
      cache.get.mockResolvedValue(null);
      repo.findById.mockResolvedValue(null);
      await expect(service.findById(1)).rejects.toThrow();
    });

    it('returns item and caches when found', async () => {
      cache.get.mockResolvedValue(null);
      repo.findById.mockResolvedValue({ id: 3 });
      await expect(service.findById(3)).resolves.toEqual({ id: 3 });
      expect(cache.set).toHaveBeenCalledWith('vehicle:3', { id: 3 }, 3600);
    });
  });

  describe('update', () => {
    it('throws NotFoundException when missing', async () => {
      cache.get.mockResolvedValue(null);
      repo.findById.mockResolvedValue(null);
      await expect(service.update(99, {} as any)).rejects.toThrow();
    });

    it('updates and invalidates caches', async () => {
      cache.get.mockResolvedValue({ id: 4 });
      repo.update.mockResolvedValue({ id: 4, year: 2025 });
      await expect(service.update(4, { year: 2025 } as any)).resolves.toEqual({ id: 4, year: 2025 });
      expect(cache.del).toHaveBeenCalledWith('vehicle:4');
      expect(cache.delByPrefix).toHaveBeenCalledWith('vehicles:page:');
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when missing', async () => {
      cache.get.mockResolvedValue(null);
      repo.findById.mockResolvedValue(null);
      await expect(service.remove(99)).rejects.toThrow();
    });

    it('removes and invalidates caches', async () => {
      cache.get.mockResolvedValue({ id: 5 });
      repo.remove.mockResolvedValue(undefined);
      await expect(service.remove(5)).resolves.toBeUndefined();
      expect(cache.del).toHaveBeenCalledWith('vehicle:5');
      expect(cache.delByPrefix).toHaveBeenCalledWith('vehicles:page:');
    });
  });
});
