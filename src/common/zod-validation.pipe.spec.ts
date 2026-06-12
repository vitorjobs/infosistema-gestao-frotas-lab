import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe';

describe('ZodValidationPipe', () => {
  const schema = z.object({
    name: z.string().min(1),
    age: z.coerce.number().int().positive(),
  });

  it('retorna dados validados quando o payload e valido', () => {
    const pipe = new ZodValidationPipe(schema);
    expect(pipe.transform({ name: 'Toyota', age: '10' })).toEqual({
      name: 'Toyota',
      age: 10,
    });
  });

  it('lanca BadRequestException com erros formatados quando invalido', () => {
    const pipe = new ZodValidationPipe(schema);

    try {
      pipe.transform({ name: '', age: -1 });
      fail('Deveria lancar BadRequestException');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse() as {
        message: string;
        errors: Array<{ path: string; message: string }>;
      };
      expect(response.message).toBe('Validacao falhou');
      expect(response.errors.length).toBeGreaterThan(0);
      expect(response.errors[0]).toHaveProperty('path');
      expect(response.errors[0]).toHaveProperty('message');
    }
  });
});
