import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { GlobalExceptionFilter } from './http-exception.filter';

describe('GlobalExceptionFilter', () => {
  const filter = new GlobalExceptionFilter();

  const createHost = () => {
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const request = { url: '/api/brands', method: 'POST' };

    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => request,
      }),
    } as unknown as ArgumentsHost;

    return { host, status, json };
  };

  it('formata HttpException com envelope padronizado', () => {
    const { host, status, json } = createHost();

    filter.catch(new BadRequestException('Payload invalido'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        path: '/api/brands',
        method: 'POST',
        error: expect.objectContaining({
          message: 'Payload invalido',
        }),
      }),
    );
  });

  it('mapeia violacao unica do SQL Server para 409', () => {
    const { host, status, json } = createHost();
    const driverError = Object.assign(new Error('query failed'), {
      number: 2627,
    });
    const exception = new QueryFailedError('INSERT', [], driverError as Error);

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        error: expect.objectContaining({
          code: 'UniqueConstraintViolation',
        }),
      }),
    );
  });

  it('retorna 500 para erros desconhecidos', () => {
    const { host, status } = createHost();

    filter.catch(new Error('boom'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('extrai mensagem de array em HttpException', () => {
    const { host, json } = createHost();
    const exception = new HttpException(
      { message: ['campo obrigatorio', 'formato invalido'] },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: 'campo obrigatorio; formato invalido',
        }),
      }),
    );
  });
});
