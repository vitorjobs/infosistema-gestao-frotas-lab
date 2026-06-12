import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { BRANDS_REPOSITORY, CACHE_SERVICE } from '../common/constants';
import { BrandsService } from './marcas.service';

const mockRepo = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  countModels: jest.fn(),
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

describe('BrandsService', () => {
  let service: BrandsService;
  let repo: ReturnType<typeof mockRepo>;
  let cache: ReturnType<typeof mockCache>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandsService,
        { provide: BRANDS_REPOSITORY, useFactory: mockRepo },
        { provide: CACHE_SERVICE, useFactory: mockCache },
        { provide: ConfigService, useFactory: mockConfig },
      ],
    }).compile();

    service = module.get(BrandsService);
    repo = module.get(BRANDS_REPOSITORY);
    cache = module.get(CACHE_SERVICE);
  });

  it('creates a brand with automatic created_by metadata', async () => {
    repo.findByName.mockResolvedValue(null);
    repo.create.mockResolvedValue({ id: 1, name: 'Ford', created_by: 'aivacol' });

    await expect(service.create({ name: 'Ford' })).resolves.toEqual({
      id: 1,
      name: 'Ford',
      created_by: 'aivacol',
    });
    expect(cache.delByPrefix).toHaveBeenCalledWith('brands:page:');
  });

  it('rejects duplicate brand names', async () => {
    repo.findByName.mockResolvedValue({ id: 1, name: 'Ford' });

    await expect(service.create({ name: 'Ford' })).rejects.toMatchObject({
      response: expect.objectContaining({
        error: 'UniqueConstraintViolation',
      }),
    });
  });

  it('throws when finding a missing brand', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(service.findById(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns cached paginated brands when available', async () => {
    const cached = {
      data: [{ id: 1, name: 'Ford' }],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    };
    cache.get.mockResolvedValue(cached);

    await expect(service.findAll(1, 20)).resolves.toEqual(cached);
    expect(cache.get).toHaveBeenCalledWith('brands:page:1:20');
    expect(repo.findAll).not.toHaveBeenCalled();
  });

  it('caches paginated brands when cache misses', async () => {
    const paginated = {
      data: [{ id: 1, name: 'Ford' }],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    };
    cache.get.mockResolvedValue(null);
    repo.findAll.mockResolvedValue(paginated);

    await expect(service.findAll(1, 20)).resolves.toEqual(paginated);
    expect(repo.findAll).toHaveBeenCalledWith(1, 20);
    expect(cache.set).toHaveBeenCalledWith('brands:page:1:20', paginated, 3600);
  });

  it('updates a brand when name is unique', async () => {
    repo.findById.mockResolvedValue({ id: 1, name: 'Old' });
    repo.findByName.mockResolvedValue(null);
    repo.update.mockResolvedValue({ id: 1, name: 'New' });

    await expect(service.update(1, { name: 'New' })).resolves.toEqual({ id: 1, name: 'New' });
    expect(cache.delByPrefix).toHaveBeenCalledWith('brands:page:');
  });

  it('blocks removal when models reference the brand', async () => {
    repo.findById.mockResolvedValue({ id: 1, name: 'Ford' });
    repo.countModels.mockResolvedValue(1);

    await expect(service.remove(1)).rejects.toBeInstanceOf(ConflictException);
    expect(repo.remove).not.toHaveBeenCalled();
  });
});
