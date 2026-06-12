import { UsersController } from './usuarios.controller';
import { UsersService } from './usuarios.service';

describe('UsersController', () => {
  const service = {
    findAll: jest.fn(),
    findById: jest.fn(),
  } as unknown as jest.Mocked<UsersService>;

  let controller: UsersController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UsersController(service);
  });

  it('delegates findAll with pagination', () => {
    service.findAll.mockReturnValue({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } } as never);

    controller.findAll({ page: 1, limit: 20 });
    expect(service.findAll).toHaveBeenCalledWith(1, 20);
  });

  it('delegates findById', () => {
    controller.findById(1);

    expect(service.findById).toHaveBeenCalledWith(1);
  });
});
