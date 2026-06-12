import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { USERS_REPOSITORY } from '../common/constants';
import { UsersService } from './usuarios.service';

const mockRepo = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: USERS_REPOSITORY, useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(UsersService);
    repo = module.get(USERS_REPOSITORY);
  });

  it('returns paginated users', async () => {
    const paginated = {
      data: [{ id: 1, nickname: 'aivacol' }],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    };
    repo.findAll.mockResolvedValue(paginated);

    await expect(service.findAll(1, 20)).resolves.toEqual(paginated);
  });

  it('throws when user is missing', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(service.findById(99)).rejects.toBeInstanceOf(NotFoundException);
  });
});
