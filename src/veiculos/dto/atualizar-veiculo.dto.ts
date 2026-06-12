import { ApiPropertyOptional } from '@nestjs/swagger';
import { z } from 'zod';
import { createVehicleSchema, CreateVehicleDto } from './criar-veiculo.dto';

const currentYear = new Date().getFullYear();

export class UpdateVehicleDto implements Partial<CreateVehicleDto> {
  @ApiPropertyOptional({
    example: 'ABC1D24',
    minLength: 1,
    maxLength: 10,
    description: 'A API normaliza o valor para maiusculas.',
  })
  license_plate?: string;

  @ApiPropertyOptional({
    example: '9BWZZZ377VT004252',
    minLength: 1,
    maxLength: 30,
    description: 'A API normaliza o valor para maiusculas.',
  })
  chassis?: string;

  @ApiPropertyOptional({ example: '12345678902', minLength: 1, maxLength: 20 })
  renavam?: string;

  @ApiPropertyOptional({ example: 2026, minimum: 1900, maximum: currentYear + 1 })
  year?: number;

  @ApiPropertyOptional({
    example: 1,
    minimum: 1,
    description: 'Quando informado, o id do modelo precisa existir.',
  })
  model_id?: number;
}

export const updateVehicleSchema = createVehicleSchema
  .omit({ created_by: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Informe ao menos um campo',
  });
