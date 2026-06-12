import { ApiProperty } from '@nestjs/swagger';
import { ModelResponseDto } from '../../modelos/dto/resposta-modelo.dto';

export class VehicleResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'ABC1D23', maxLength: 10 })
  license_plate!: string;

  @ApiProperty({ example: '9BWZZZ377VT004251', maxLength: 30 })
  chassis!: string;

  @ApiProperty({ example: '12345678901', maxLength: 20 })
  renavam!: string;

  @ApiProperty({ example: 2025, minimum: 1900 })
  year!: number;

  @ApiProperty({ example: 1 })
  model_id!: number;

  @ApiProperty({ type: () => ModelResponseDto })
  model!: ModelResponseDto;

  @ApiProperty({ example: 'aivacol', maxLength: 120 })
  created_by!: string;

  @ApiProperty({ example: '2026-06-10T00:00:00.000Z', format: 'date-time' })
  created_at!: Date;

  @ApiProperty({ example: '2026-06-10T00:00:00.000Z', format: 'date-time' })
  updated_at!: Date;
}
