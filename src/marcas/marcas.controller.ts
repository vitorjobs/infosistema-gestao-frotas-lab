import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/usuario-atual.decorator';
import { JwtUser } from '../auth/types/jwt-usuario.type';
import { ApiErrorResponseDto } from '../common/dto/resposta-erro-api.dto';
import { PaginatedBrandResponseDto } from '../common/dto/resposta-paginada.dto';
import { PaginationQueryDto } from '../common/dto/consulta-paginacao.dto';
import { paginationQuerySchema } from '../common/pagination';
import { idParamSchema } from '../common/schemas';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { BrandsService } from './marcas.service';
import { BrandResponseDto } from './dto/resposta-marca.dto';
import { createBrandSchema, CreateBrandDto } from './dto/criar-marca.dto';
import { updateBrandSchema, UpdateBrandDto } from './dto/atualizar-marca.dto';

@ApiTags('brands')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({
  description: 'JWT ausente, invalido ou expirado.',
  type: ApiErrorResponseDto,
})
@Controller('brands')
export class BrandsController {
  constructor(private readonly service: BrandsService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar marca',
    description:
      'Cria uma marca unica. O campo `created_by` e preenchido automaticamente pelo usuario autenticado quando nao enviado.',
  })
  @ApiBody({ type: CreateBrandDto })
  @ApiCreatedResponse({ description: 'Marca criada.', type: BrandResponseDto })
  @ApiBadRequestResponse({
    description: 'Payload invalido conforme validacao Zod.',
    type: ApiErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Ja existe uma marca com o mesmo nome.',
    type: ApiErrorResponseDto,
  })
  create(
    @Body(new ZodValidationPipe<CreateBrandDto>(createBrandSchema)) dto: CreateBrandDto,
    @CurrentUser() user?: JwtUser,
  ) {
    return this.service.create(dto, user?.nickname);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar marcas',
    description:
      'Retorna marcas paginadas com cache Redis por pagina (`brands:page:{page}:{limit}`) e TTL configuravel por `REDIS_TTL`.',
  })
  @ApiQuery({ type: PaginationQueryDto })
  @ApiOkResponse({ description: 'Lista paginada de marcas.', type: PaginatedBrandResponseDto })
  @ApiBadRequestResponse({
    description: 'Parametros de paginacao invalidos.',
    type: ApiErrorResponseDto,
  })
  findAll(
    @Query(new ZodValidationPipe(paginationQuerySchema))
    query: { page: number; limit: number },
  ) {
    return this.service.findAll(query.page, query.limit);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar marca por id',
    description: 'Retorna uma marca pelo identificador positivo informado na URL.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'Id positivo da marca.' })
  @ApiOkResponse({ description: 'Marca encontrada.', type: BrandResponseDto })
  @ApiBadRequestResponse({
    description: 'Parametro `id` invalido.',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Marca nao encontrada.', type: ApiErrorResponseDto })
  findById(@Param('id', new ZodValidationPipe<number>(idParamSchema)) id: number) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar marca',
    description: 'Atualiza o nome de uma marca existente. Ao menos um campo deve ser enviado.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'Id positivo da marca.' })
  @ApiBody({ type: UpdateBrandDto })
  @ApiOkResponse({ description: 'Marca atualizada.', type: BrandResponseDto })
  @ApiBadRequestResponse({
    description: 'Parametro ou payload invalido conforme validacao Zod.',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Marca nao encontrada.', type: ApiErrorResponseDto })
  @ApiConflictResponse({
    description: 'Ja existe outra marca com o mesmo nome.',
    type: ApiErrorResponseDto,
  })
  update(
    @Param('id', new ZodValidationPipe<number>(idParamSchema)) id: number,
    @Body(new ZodValidationPipe<UpdateBrandDto>(updateBrandSchema)) dto: UpdateBrandDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover marca',
    description: 'Remove uma marca somente quando nenhum modelo estiver vinculado a ela.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'Id positivo da marca.' })
  @ApiNoContentResponse({ description: 'Marca removida. Resposta 204 sem corpo.' })
  @ApiBadRequestResponse({
    description: 'Parametro `id` invalido.',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Marca nao encontrada.', type: ApiErrorResponseDto })
  @ApiConflictResponse({
    description: 'A marca nao pode ser removida enquanto houver modelos vinculados.',
    type: ApiErrorResponseDto,
  })
  remove(@Param('id', new ZodValidationPipe<number>(idParamSchema)) id: number) {
    return this.service.remove(id);
  }
}
