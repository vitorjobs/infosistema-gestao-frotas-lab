import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { z } from 'zod';

export class CreateBrandDto {
  @ApiProperty({ example: 'Toyota', minLength: 1, maxLength: 120 })
  name!: string;

  @ApiPropertyOptional({
    example: 'aivacol',
    minLength: 1,
    maxLength: 120,
    description: 'Opcional. Quando omitido, a API usa o usuario autenticado ou DEFAULT_CREATED_BY.',
  })
  created_by?: string;
}

export const createBrandSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    created_by: z.string().trim().min(1).max(120).optional(),
  })
  .strict();
