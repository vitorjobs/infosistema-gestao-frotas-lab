import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtUser } from './types/jwt-usuario.type';

describe('AuthController', () => {
  const authService = {
    login: jest.fn(),
  } as unknown as jest.Mocked<Pick<AuthService, 'login'>>;

  let controller: AuthController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController(authService as unknown as AuthService);
  });

  it('delegates login to AuthService', async () => {
    const result = {
      access_token: 'token',
      token_type: 'Bearer',
      user: { sub: 1, nickname: 'aivacol', email: 'aivacol@example.com', name: 'Aivacol' },
    };
    authService.login.mockResolvedValue(result);

    await expect(controller.login({ nickname: 'aivacol', password: 'aivacol' })).resolves.toBe(result);
    expect(authService.login).toHaveBeenCalledWith({ nickname: 'aivacol', password: 'aivacol' });
  });

  it('returns the authenticated user from the request context', () => {
    const user: JwtUser = { sub: 1, nickname: 'aivacol', email: 'aivacol@example.com', name: 'Aivacol' };

    expect(controller.me(user)).toBe(user);
  });
});
