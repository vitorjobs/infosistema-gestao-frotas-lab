import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_SERVICE, MODELS_REPOSITORY } from '../common/constants';
import { ModelsService } from './modelos.service';

const mockRepo = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  brandExists: jest.fn(),
  countVehicles: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

const mockConfig = () => ({
  get: jest.fn((key: string, defaultValue?: unknown) => {
    if (key === 'DEFAULT_CREATED_BY') return 'aivacol';
    if (key === 'REDIS_TTL') return 3600;
    return defaultValue;
  }),
});

const mockCache = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  delByPrefix: jest.fn(),
  ping: jest.fn(),
});

describe('ModelsService', () => {
  let service: ModelsService;
  let repo: ReturnType<typeof mockRepo>;
  let cache: ReturnType<typeof mockCache>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModelsService,
        { provide: MODELS_REPOSITORY, useFactory: mockRepo },
        { provide: CACHE_SERVICE, useFactory: mockCache },
        { provide: ConfigService, useFactory: mockConfig },
      ],
    }).compile();

    service = module.get(ModelsService);
    repo = module.get(MODELS_REPOSITORY);
    cache = module.get(CACHE_SERVICE);
  });

  it('creates a model with automatic created_by metadata', async () => {
    repo.findByName.mockResolvedValue(null);
    repo.create.mockResolvedValue({ id: 1, name: 'Truck', created_by: 'aivacol' });

    await expect(service.create({ name: 'Truck' })).resolves.toEqual({
      id: 1,
      name: 'Truck',
      created_by: 'aivacol',
    });
    expect(repo.create).toHaveBeenCalledWith({ name: 'Truck', created_by: 'aivacol' });
    expect(cache.delByPrefix).toHaveBeenCalledWith('models:page:');
  });

  it('rejects duplicate model names', async () => {
    repo.findByName.mockResolvedValue({ id: 1, name: 'Truck' });

    await expect(service.create({ name: 'Truck' })).rejects.toMatchObject({
      response: expect.objectContaining({
        error: 'UniqueConstraintViolation',
      }),
    });
  });

  it('throws when finding a missing model', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(service.findById(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns cached paginated models when available', async () => {
    const cached = {
      data: [{ id: 1, name: 'Truck' }],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    };
    cache.get.mockResolvedValue(cached);

    await expect(service.findAll(1, 20)).resolves.toEqual(cached);
    expect(cache.get).toHaveBeenCalledWith('models:page:1:20');
    expect(repo.findAll).not.toHaveBeenCalled();
  });

  it('caches paginated models when cache misses', async () => {
    const paginated = {
      data: [{ id: 1, name: 'Truck' }],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    };
    cache.get.mockResolvedValue(null);
    repo.findAll.mockResolvedValue(paginated);

    await expect(service.findAll(1, 20)).resolves.toEqual(paginated);
    expect(repo.findAll).toHaveBeenCalledWith(1, 20);
    expect(cache.set).toHaveBeenCalledWith('models:page:1:20', paginated, 3600);
  });

  it('updates a model when name is unique', async () => {
    repo.findById.mockResolvedValue({ id: 1, name: 'Old' });
    repo.findByName.mockResolvedValue(null);
    repo.update.mockResolvedValue({ id: 1, name: 'New' });

    await expect(service.update(1, { name: 'New' })).resolves.toEqual({ id: 1, name: 'New' });
    expect(cache.delByPrefix).toHaveBeenCalledWith('models:page:');
  });

  it('blocks removal when vehicles reference the model', async () => {
    repo.findById.mockResolvedValue({ id: 1, name: 'Truck' });
    repo.countVehicles.mockResolvedValue(1);

    await expect(service.remove(1)).rejects.toBeInstanceOf(ConflictException);
    expect(repo.remove).not.toHaveBeenCalled();
  });
});
