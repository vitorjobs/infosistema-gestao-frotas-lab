import { VehiclesController } from './veiculos.controller';
import { VehiclesService } from './veiculos.service';

describe('VehiclesController', () => {
  const service = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as unknown as jest.Mocked<VehiclesService>;

  let controller: VehiclesController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new VehiclesController(service);
  });

  it('delegates create with authenticated nickname', () => {
    const dto = {
      model_id: 1,
      license_plate: 'ABC1D23',
      chassis: '9BWZZZ377VT004251',
      renavam: '12345678901',
      year: 2025,
    };
    service.create.mockReturnValue({ id: 1, ...dto } as never);

    expect(
      controller.create(dto, {
        sub: 1,
        nickname: 'aivacol',
        email: 'aivacol@example.com',
        name: 'Aivacol',
      }),
    ).toEqual({ id: 1, ...dto });
    expect(service.create).toHaveBeenCalledWith(dto, 'aivacol');
  });

  it('delegates findAll with pagination', () => {
    service.findAll.mockReturnValue({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } } as never);

    controller.findAll({ page: 1, limit: 20 });
    expect(service.findAll).toHaveBeenCalledWith(1, 20);
  });

  it('delegates findById, update and remove', () => {
    controller.findById(1);
    controller.update(1, { license_plate: 'XYZ9A88' });
    controller.remove(1);

    expect(service.findById).toHaveBeenCalledWith(1);
    expect(service.update).toHaveBeenCalledWith(1, { license_plate: 'XYZ9A88' });
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
