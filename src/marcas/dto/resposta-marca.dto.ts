import { ApiProperty } from '@nestjs/swagger';

export class BrandResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Toyota', maxLength: 120 })
  name!: string;

  @ApiProperty({ example: 'aivacol', maxLength: 120 })
  created_by!: string;

  @ApiProperty({ example: '2026-06-10T00:00:00.000Z', format: 'date-time' })
  created_at!: Date;

  @ApiProperty({ example: '2026-06-10T00:00:00.000Z', format: 'date-time' })
  updated_at!: Date;
}
