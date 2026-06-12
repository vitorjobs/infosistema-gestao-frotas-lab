import { ApiProperty } from '@nestjs/swagger';
import { BrandResponseDto } from '../../marcas/dto/resposta-marca.dto';
import { ModelResponseDto } from '../../modelos/dto/resposta-modelo.dto';
import { UserResponseDto } from '../../usuarios/dto/resposta-usuario.dto';
import { VehicleResponseDto } from '../../veiculos/dto/resposta-veiculo.dto';

export class PaginatedMetaDto {
  @ApiProperty({ example: 42, description: 'Total de registros encontrados.' })
  total!: number;

  @ApiProperty({ example: 1, description: 'Pagina atual.' })
  page!: number;

  @ApiProperty({ example: 20, description: 'Itens por pagina.' })
  limit!: number;

  @ApiProperty({ example: 3, description: 'Total de paginas disponiveis.' })
  totalPages!: number;
}

export class PaginatedBrandResponseDto {
  @ApiProperty({ type: BrandResponseDto, isArray: true })
  data!: BrandResponseDto[];

  @ApiProperty({ type: PaginatedMetaDto })
  meta!: PaginatedMetaDto;
}

export class PaginatedModelResponseDto {
  @ApiProperty({ type: ModelResponseDto, isArray: true })
  data!: ModelResponseDto[];

  @ApiProperty({ type: PaginatedMetaDto })
  meta!: PaginatedMetaDto;
}

export class PaginatedVehicleResponseDto {
  @ApiProperty({ type: VehicleResponseDto, isArray: true })
  data!: VehicleResponseDto[];

  @ApiProperty({ type: PaginatedMetaDto })
  meta!: PaginatedMetaDto;
}

export class PaginatedUserResponseDto {
  @ApiProperty({ type: UserResponseDto, isArray: true })
  data!: UserResponseDto[];

  @ApiProperty({ type: PaginatedMetaDto })
  meta!: PaginatedMetaDto;
}
