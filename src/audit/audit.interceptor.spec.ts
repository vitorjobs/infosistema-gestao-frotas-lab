import { ExecutionContext } from '@nestjs/common';
import { of, throwError, lastValueFrom } from 'rxjs';
import { AuditInterceptor } from './audit.interceptor';
import { AuditService } from './audit.service';

describe('AuditInterceptor', () => {
  const createContext = (overrides: Partial<{
    method: string;
    url: string;
    ip: string;
    headers: Record<string, string | string[] | undefined>;
    body: unknown;
    user: { sub?: number; nickname?: string };
    statusCode: number;
  }> = {}) => {
    const request = {
      method: 'POST',
      url: '/api/brands?token=secret',
      ip: '127.0.0.1',
      headers: { 'user-agent': 'jest-agent' },
      body: { name: 'Toyota', password: 'secret' },
      user: { sub: 1, nickname: 'aivacol' },
      ...overrides,
    };
    const response = { statusCode: overrides.statusCode ?? 201 };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as unknown as ExecutionContext;
  };

  const createAuditService = (enabled = true) =>
    ({
      isEnabled: jest.fn(() => enabled),
      record: jest.fn().mockResolvedValue(undefined),
    }) as unknown as jest.Mocked<Pick<AuditService, 'isEnabled' | 'record'>>;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('nao registra auditoria quando o servico esta desabilitado', async () => {
    const auditService = createAuditService(false);
    const interceptor = new AuditInterceptor(auditService as unknown as AuditService);
    const next = { handle: jest.fn(() => of({ ok: true })) };

    await expect(lastValueFrom(interceptor.intercept(createContext(), next))).resolves.toEqual({
      ok: true,
    });

    expect(next.handle).toHaveBeenCalledTimes(1);
    expect(auditService.record).not.toHaveBeenCalled();
  });

  it('ignora rotas de health, metrics e docs', async () => {
    const auditService = createAuditService(true);
    const interceptor = new AuditInterceptor(auditService as unknown as AuditService);
    const next = { handle: jest.fn(() => of({ status: 'ok' })) };

    await lastValueFrom(interceptor.intercept(createContext({ url: '/api/health' }), next));
    await lastValueFrom(interceptor.intercept(createContext({ url: '/api/metrics' }), next));
    await lastValueFrom(interceptor.intercept(createContext({ url: '/api/docs' }), next));

    expect(next.handle).toHaveBeenCalledTimes(3);
    expect(auditService.record).not.toHaveBeenCalled();
  });

  it('registra metodo, path, status, usuario, duracao e corpo sanitizado', async () => {
    const auditService = createAuditService(true);
    const interceptor = new AuditInterceptor(auditService as unknown as AuditService);
    const next = { handle: jest.fn(() => of({ id: 1 })) };
    jest.spyOn(Date, 'now').mockReturnValueOnce(1000).mockReturnValueOnce(1042);

    await lastValueFrom(
      interceptor.intercept(
        createContext({
          body: {
            name: 'Toyota',
            nested: { access_token: 'jwt' },
            tokens: [{ refresh_token: 'refresh' }],
          },
        }),
        next,
      ),
    );

    expect(auditService.record).toHaveBeenCalledWith({
      method: 'POST',
      path: '/api/brands',
      statusCode: 201,
      userId: 1,
      nickname: 'aivacol',
      ip: '127.0.0.1',
      userAgent: 'jest-agent',
      requestBody: {
        name: 'Toyota',
        nested: { access_token: '[REDACTED]' },
        tokens: [{ refresh_token: '[REDACTED]' }],
      },
      durationMs: 42,
    });
  });

  it('registra status de erro sem engolir a excecao', async () => {
    const auditService = createAuditService(true);
    const interceptor = new AuditInterceptor(auditService as unknown as AuditService);
    const error = { status: 403 };
    const next = { handle: jest.fn(() => throwError(() => error)) };
    jest.spyOn(Date, 'now').mockReturnValueOnce(2000).mockReturnValueOnce(2007);

    await expect(lastValueFrom(interceptor.intercept(createContext(), next))).rejects.toBe(error);

    expect(auditService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        durationMs: 7,
      }),
    );
  });
});
