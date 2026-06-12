import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { type ZodIssue, type ZodTypeAny } from 'zod';

@Injectable()
export class ZodValidationPipe<T = unknown> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodTypeAny) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Validacao falhou',
        errors: result.error.issues.map((issue) => this.formatIssue(issue)),
      });
    }

    return result.data as T;
  }

  private formatIssue(issue: ZodIssue) {
    return {
      path: issue.path.join('.'),
      message: issue.message,
    };
  }
}
