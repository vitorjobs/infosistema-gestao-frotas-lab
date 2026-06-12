import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_ROUTE } from '../common/constants';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;

  const guard = new JwtAuthGuard(reflector);

  const createContext = () =>
    ({
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    }) as unknown as ExecutionContext;

  it('permite rota publica sem validar JWT', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);
    const canActivateSpy = jest
      .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
      .mockReturnValue(false);

    expect(guard.canActivate(createContext())).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_ROUTE, expect.any(Array));
    expect(canActivateSpy).not.toHaveBeenCalled();

    canActivateSpy.mockRestore();
  });

  it('delega para AuthGuard quando rota nao e publica', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    const canActivateSpy = jest
      .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
      .mockReturnValue(true);

    expect(guard.canActivate(createContext())).toBe(true);
    expect(canActivateSpy).toHaveBeenCalled();

    canActivateSpy.mockRestore();
  });
});
