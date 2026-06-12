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
import { PaginatedModelResponseDto } from '../common/dto/resposta-paginada.dto';
import { PaginationQueryDto } from '../common/dto/consulta-paginacao.dto';
import { paginationQuerySchema } from '../common/pagination';
import { idParamSchema } from '../common/schemas';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ModelResponseDto } from './dto/resposta-modelo.dto';
import { createModelSchema, CreateModelDto } from './dto/criar-modelo.dto';
import { updateModelSchema, UpdateModelDto } from './dto/atualizar-modelo.dto';
import { ModelsService } from './modelos.service';

@ApiTags('models')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({
  description: 'JWT ausente, invalido ou expirado.',
  type: ApiErrorResponseDto,
})
@Controller('models')
export class ModelsController {
  constructor(private readonly service: ModelsService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar modelo',
    description:
      'Cria um modelo unico. `brand_id` e opcional, mas quando informado precisa apontar para uma marca existente. `created_by` e preenchido automaticamente pelo usuario autenticado quando nao enviado.',
  })
  @ApiBody({ type: CreateModelDto })
  @ApiCreatedResponse({ description: 'Modelo criado.', type: ModelResponseDto })
  @ApiBadRequestResponse({
    description: 'Payload invalido conforme validacao Zod.',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Marca informada em `brand_id` nao encontrada.',
    type: ApiErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Ja existe um modelo com o mesmo nome.',
    type: ApiErrorResponseDto,
  })
  create(
    @Body(new ZodValidationPipe<CreateModelDto>(createModelSchema)) dto: CreateModelDto,
    @CurrentUser() user?: JwtUser,
  ) {
    return this.service.create(dto, user?.nickname);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar modelos',
    description:
      'Retorna modelos paginados com a marca vinculada quando existir. A listagem usa cache Redis por pagina (`models:page:{page}:{limit}`) com TTL configuravel por `REDIS_TTL`.',
  })
  @ApiQuery({ type: PaginationQueryDto })
  @ApiOkResponse({ description: 'Lista paginada de modelos.', type: PaginatedModelResponseDto })
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
    summary: 'Buscar modelo por id',
    description: 'Retorna um modelo pelo identificador positivo informado na URL.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'Id positivo do modelo.' })
  @ApiOkResponse({ description: 'Modelo encontrado.', type: ModelResponseDto })
  @ApiBadRequestResponse({
    description: 'Parametro `id` invalido.',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Modelo nao encontrado.', type: ApiErrorResponseDto })
  findById(@Param('id', new ZodValidationPipe<number>(idParamSchema)) id: number) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar modelo',
    description:
      'Atualiza um modelo existente. Ao menos um campo deve ser enviado. `brand_id` pode receber um id existente ou `null` para remover o vinculo.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'Id positivo do modelo.' })
  @ApiBody({ type: UpdateModelDto })
  @ApiOkResponse({ description: 'Modelo atualizado.', type: ModelResponseDto })
  @ApiBadRequestResponse({
    description: 'Parametro ou payload invalido conforme validacao Zod.',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Modelo nao encontrado ou marca informada em `brand_id` nao encontrada.',
    type: ApiErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Ja existe outro modelo com o mesmo nome.',
    type: ApiErrorResponseDto,
  })
  update(
    @Param('id', new ZodValidationPipe<number>(idParamSchema)) id: number,
    @Body(new ZodValidationPipe<UpdateModelDto>(updateModelSchema)) dto: UpdateModelDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover modelo',
    description: 'Remove um modelo somente quando nenhum veiculo estiver vinculado a ele.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'Id positivo do modelo.' })
  @ApiNoContentResponse({ description: 'Modelo removido. Resposta 204 sem corpo.' })
  @ApiBadRequestResponse({
    description: 'Parametro `id` invalido.',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Modelo nao encontrado.', type: ApiErrorResponseDto })
  @ApiConflictResponse({
    description: 'O modelo nao pode ser removido enquanto houver veiculos vinculados.',
    type: ApiErrorResponseDto,
  })
  remove(@Param('id', new ZodValidationPipe<number>(idParamSchema)) id: number) {
    return this.service.remove(id);
  }
}
