import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BrandResponseDto } from '../../marcas/dto/resposta-marca.dto';

export class ModelResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Corolla', maxLength: 120 })
  name!: string;

  @ApiPropertyOptional({
    example: 1,
    nullable: true,
    description: 'Identificador da marca. Pode ser nulo quando o modelo nao estiver vinculado.',
  })
  brand_id?: number | null;

  @ApiPropertyOptional({ type: () => BrandResponseDto, nullable: true })
  brand?: BrandResponseDto | null;

  @ApiProperty({ example: 'aivacol', maxLength: 120 })
  created_by!: string;

  @ApiProperty({ example: '2026-06-10T00:00:00.000Z', format: 'date-time' })
  created_at!: Date;

  @ApiProperty({ example: '2026-06-10T00:00:00.000Z', format: 'date-time' })
  updated_at!: Date;
}
