import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { z } from 'zod';

const currentYear = new Date().getFullYear();

export class CreateVehicleDto {
  @ApiProperty({
    example: 'ABC1D23',
    minLength: 1,
    maxLength: 10,
    description: 'A API normaliza o valor para maiusculas.',
  })
  license_plate!: string;

  @ApiProperty({
    example: '9BWZZZ377VT004251',
    minLength: 1,
    maxLength: 30,
    description: 'A API normaliza o valor para maiusculas.',
  })
  chassis!: string;

  @ApiProperty({ example: '12345678901', minLength: 1, maxLength: 20 })
  renavam!: string;

  @ApiProperty({ example: 2025, minimum: 1900, maximum: currentYear + 1 })
  year!: number;

  @ApiProperty({
    example: 1,
    minimum: 1,
    description: 'Modelo obrigatorio. O id informado precisa existir.',
  })
  model_id!: number;

  @ApiPropertyOptional({
    example: 'aivacol',
    minLength: 1,
    maxLength: 120,
    description: 'Opcional. Quando omitido, a API usa o usuario autenticado ou DEFAULT_CREATED_BY.',
  })
  created_by?: string;
}

export const createVehicleSchema = z
  .object({
    license_plate: z.string().trim().min(1).max(10).transform((value) => value.toUpperCase()),
    chassis: z.string().trim().min(1).max(30).transform((value) => value.toUpperCase()),
    renavam: z.string().trim().min(1).max(20),
    year: z.coerce.number().int().min(1900).max(currentYear + 1),
    model_id: z.coerce.number().int().positive(),
    created_by: z.string().trim().min(1).max(120).optional(),
  })
  .strict();
