import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiErrorResponseDto } from '../common/dto/resposta-erro-api.dto';
import { PaginatedUserResponseDto } from '../common/dto/resposta-paginada.dto';
import { PaginationQueryDto } from '../common/dto/consulta-paginacao.dto';
import { paginationQuerySchema } from '../common/pagination';
import { idParamSchema } from '../common/schemas';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { UserResponseDto } from './dto/resposta-usuario.dto';
import { UsersService } from './usuarios.service';

@ApiTags('users')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({
  description: 'JWT ausente, invalido ou expirado.',
  type: ApiErrorResponseDto,
})
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar usuarios',
    description:
      'Retorna usuarios paginados sem expor `password_hash`. Parametros: `page` (padrao 1) e `limit` (padrao 20, max 100).',
  })
  @ApiQuery({ type: PaginationQueryDto })
  @ApiOkResponse({ description: 'Lista paginada de usuarios.', type: PaginatedUserResponseDto })
  @ApiBadRequestResponse({ description: 'Parametros de paginacao invalidos.', type: ApiErrorResponseDto })
  findAll(
    @Query(new ZodValidationPipe(paginationQuerySchema))
    query: { page: number; limit: number },
  ) {
    return this.service.findAll(query.page, query.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuario por id' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Usuario encontrado.', type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Parametro `id` invalido.', type: ApiErrorResponseDto })
  @ApiNotFoundResponse({ description: 'Usuario nao encontrado.', type: ApiErrorResponseDto })
  findById(@Param('id', new ZodValidationPipe<number>(idParamSchema)) id: number) {
    return this.service.findById(id);
  }
}
