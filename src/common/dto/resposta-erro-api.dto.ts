import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ApiErrorDto {
  @ApiProperty({ example: 'RequisicaoInvalida' })
  code!: string;

  @ApiProperty({ example: 'Validacao falhou' })
  message!: string;

  @ApiPropertyOptional({
    example: [{ path: 'name', message: 'Campo deve conter pelo menos 1 caractere' }],
  })
  details?: unknown;
}

export class ApiErrorResponseDto {
  @ApiProperty({ example: false })
  success!: boolean;

  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ example: '2026-06-10T00:00:00.000Z', format: 'date-time' })
  timestamp!: string;

  @ApiProperty({ example: '/api/models' })
  path!: string;

  @ApiProperty({ example: 'POST' })
  method!: string;

  @ApiProperty({ type: ApiErrorDto })
  error!: ApiErrorDto;
}
