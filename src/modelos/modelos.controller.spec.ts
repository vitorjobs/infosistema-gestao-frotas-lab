import { ModelsController } from './modelos.controller';
import { ModelsService } from './modelos.service';

describe('ModelsController', () => {
  const service = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as unknown as jest.Mocked<ModelsService>;

  let controller: ModelsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ModelsController(service);
  });

  it('delegates create with authenticated nickname', () => {
    const dto = { name: 'Corolla', brand_id: 1 };
    service.create.mockReturnValue({ id: 1, ...dto } as never);

    expect(
      controller.create(dto, {
        sub: 1,
        nickname: 'aivacol',
        email: 'aivacol@example.com',
        name: 'Aivacol',
      }),
    ).toEqual({
      id: 1,
      name: 'Corolla',
      brand_id: 1,
    });
    expect(service.create).toHaveBeenCalledWith(dto, 'aivacol');
  });

  it('delegates findAll with pagination', () => {
    service.findAll.mockReturnValue({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } } as never);

    controller.findAll({ page: 1, limit: 20 });
    expect(service.findAll).toHaveBeenCalledWith(1, 20);
  });

  it('delegates findById, update and remove', () => {
    controller.findById(1);
    controller.update(1, { brand_id: null });
    controller.remove(1);

    expect(service.findById).toHaveBeenCalledWith(1);
    expect(service.update).toHaveBeenCalledWith(1, { brand_id: null });
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
