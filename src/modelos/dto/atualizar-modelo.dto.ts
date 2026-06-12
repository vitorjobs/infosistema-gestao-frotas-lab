import { ApiPropertyOptional } from '@nestjs/swagger';
import { z } from 'zod';

export class UpdateModelDto {
  @ApiPropertyOptional({ example: 'Corolla Updated', minLength: 1, maxLength: 120 })
  name?: string;

  @ApiPropertyOptional({
    example: 1,
    minimum: 1,
    nullable: true,
    description: 'Informe um id existente para vincular a uma marca, null para remover o vinculo.',
  })
  brand_id?: number | null;
}

export const updateModelSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    brand_id: z.union([z.coerce.number().int().positive(), z.null()]).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Informe ao menos um campo',
  });
