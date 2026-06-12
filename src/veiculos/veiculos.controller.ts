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
import { PaginatedVehicleResponseDto } from '../common/dto/resposta-paginada.dto';
import { PaginationQueryDto } from '../common/dto/consulta-paginacao.dto';
import { paginationQuerySchema } from '../common/pagination';
import { idParamSchema } from '../common/schemas';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { createVehicleSchema, CreateVehicleDto } from './dto/criar-veiculo.dto';
import { updateVehicleSchema, UpdateVehicleDto } from './dto/atualizar-veiculo.dto';
import { VehicleResponseDto } from './dto/resposta-veiculo.dto';
import { VehiclesService } from './veiculos.service';

@ApiTags('vehicles')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({
  description: 'JWT ausente, invalido ou expirado.',
  type: ApiErrorResponseDto,
})
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly service: VehiclesService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar veiculo',
    description:
      'Registra um veiculo vinculado a um modelo existente. Placa e chassi sao normalizados para maiusculas. A criacao invalida o cache Redis das consultas de veiculos.',
  })
  @ApiBody({ type: CreateVehicleDto })
  @ApiCreatedResponse({ description: 'Veiculo criado.', type: VehicleResponseDto })
  @ApiBadRequestResponse({
    description: 'Payload invalido conforme validacao Zod.',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Modelo informado em `model_id` nao encontrado.',
    type: ApiErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Violacao de unicidade de placa, chassi ou renavam.',
    type: ApiErrorResponseDto,
  })
  create(
    @Body(new ZodValidationPipe<CreateVehicleDto>(createVehicleSchema)) dto: CreateVehicleDto,
    @CurrentUser() user?: JwtUser,
  ) {
    return this.service.create(dto, user?.nickname);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar veiculos',
    description:
      'Retorna veiculos paginados com o modelo vinculado. A listagem usa Redis Cache por pagina (`vehicles:page:{page}:{limit}`) com TTL configuravel por `REDIS_TTL`.',
  })
  @ApiQuery({ type: PaginationQueryDto })
  @ApiOkResponse({ description: 'Lista paginada de veiculos.', type: PaginatedVehicleResponseDto })
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
    summary: 'Buscar veiculo por id',
    description:
      'Retorna um veiculo pelo identificador positivo informado na URL. A consulta individual usa cache Redis na chave `vehicle:{id}`.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'Id positivo do veiculo.' })
  @ApiOkResponse({ description: 'Veiculo encontrado.', type: VehicleResponseDto })
  @ApiBadRequestResponse({
    description: 'Parametro `id` invalido.',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Veiculo nao encontrado.', type: ApiErrorResponseDto })
  findById(@Param('id', new ZodValidationPipe<number>(idParamSchema)) id: number) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar veiculo',
    description:
      'Atualiza um veiculo existente. Ao menos um campo deve ser enviado. Quando `model_id` for informado, ele precisa existir. A atualizacao invalida o cache Redis da lista e do item.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'Id positivo do veiculo.' })
  @ApiBody({ type: UpdateVehicleDto })
  @ApiOkResponse({ description: 'Veiculo atualizado.', type: VehicleResponseDto })
  @ApiBadRequestResponse({
    description: 'Parametro ou payload invalido conforme validacao Zod.',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Veiculo nao encontrado ou modelo informado em `model_id` nao encontrado.',
    type: ApiErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Violacao de unicidade de placa, chassi ou renavam.',
    type: ApiErrorResponseDto,
  })
  update(
    @Param('id', new ZodValidationPipe<number>(idParamSchema)) id: number,
    @Body(new ZodValidationPipe<UpdateVehicleDto>(updateVehicleSchema)) dto: UpdateVehicleDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover veiculo',
    description: 'Remove um veiculo existente e invalida o cache Redis da lista e do item.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'Id positivo do veiculo.' })
  @ApiNoContentResponse({ description: 'Veiculo removido. Resposta 204 sem corpo.' })
  @ApiBadRequestResponse({
    description: 'Parametro `id` invalido.',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Veiculo nao encontrado.', type: ApiErrorResponseDto })
  remove(@Param('id', new ZodValidationPipe<number>(idParamSchema)) id: number) {
    return this.service.remove(id);
  }
}
