import { sanitizeAuditRequestBody } from './audit-sanitizer';

describe('sanitizeAuditRequestBody', () => {
  it('mascara campos sensiveis de forma recursiva', () => {
    const result = sanitizeAuditRequestBody({
      nickname: 'aivacol',
      password: 'secret',
      nested: {
        access_token: 'jwt',
        refresh_token: 'refresh',
        Authorization: 'Bearer token',
      },
      items: [
        {
          token: 'item-token',
          value: 'safe',
        },
      ],
    });

    expect(result).toEqual({
      nickname: 'aivacol',
      password: '[REDACTED]',
      nested: {
        access_token: '[REDACTED]',
        refresh_token: '[REDACTED]',
        Authorization: '[REDACTED]',
      },
      items: [
        {
          token: '[REDACTED]',
          value: 'safe',
        },
      ],
    });
  });

  it('ignora corpos ausentes, primitivos ou arrays no nivel raiz', () => {
    expect(sanitizeAuditRequestBody(undefined)).toBeUndefined();
    expect(sanitizeAuditRequestBody('plain')).toBeUndefined();
    expect(sanitizeAuditRequestBody([{ password: 'secret' }])).toBeUndefined();
  });
});
