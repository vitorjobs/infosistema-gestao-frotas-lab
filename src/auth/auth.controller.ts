import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponseDto } from '../common/dto/resposta-erro-api.dto';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/usuario-atual.decorator';
import { Public } from './decorators/publico.decorator';
import { AuthLoginResponseDto, AuthUserDto } from './dto/resposta-autenticacao.dto';
import { loginSchema, LoginDto } from './dto/login.dto';
import { JwtUser } from './types/jwt-usuario.type';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Autenticar usuario',
    description:
      'Autentica o usuario seed padrao `aivacol` ou outro usuario cadastrado e retorna um JWT para acessar as rotas protegidas.',
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Login efetuado com sucesso. Use `access_token` como Bearer token.',
    type: AuthLoginResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Payload invalido conforme validacao Zod.',
    type: ApiErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciais invalidas.',
    type: ApiErrorResponseDto,
  })
  login(@Body(new ZodValidationPipe<LoginDto>(loginSchema)) dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Consultar usuario autenticado',
    description: 'Retorna os dados gravados no JWT depois da validacao da estrategia Passport JWT.',
  })
  @ApiOkResponse({ description: 'Usuario autenticado.', type: AuthUserDto })
  @ApiUnauthorizedResponse({
    description: 'Token ausente, invalido ou expirado.',
    type: ApiErrorResponseDto,
  })
  me(@CurrentUser() user?: JwtUser) {
    return user;
  }
}
