import { ApiPropertyOptional } from '@nestjs/swagger';
import { z } from 'zod';

export class UpdateBrandDto {
  @ApiPropertyOptional({ example: 'Toyota Updated', minLength: 1, maxLength: 120 })
  name?: string;
}

export const updateBrandSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Informe ao menos um campo',
  });
