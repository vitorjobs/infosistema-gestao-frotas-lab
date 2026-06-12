import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { z } from 'zod';

export class CreateModelDto {
  @ApiProperty({ example: 'Corolla', minLength: 1, maxLength: 120 })
  name!: string;

  @ApiPropertyOptional({
    example: 1,
    minimum: 1,
    description: 'Marca vinculada ao modelo. Quando informado, precisa existir.',
  })
  brand_id?: number;

  @ApiPropertyOptional({
    example: 'aivacol',
    minLength: 1,
    maxLength: 120,
    description: 'Opcional. Quando omitido, a API usa o usuario autenticado ou DEFAULT_CREATED_BY.',
  })
  created_by?: string;
}

export const createModelSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    brand_id: z.coerce.number().int().positive().optional(),
    created_by: z.string().trim().min(1).max(120).optional(),
  })
  .strict();
