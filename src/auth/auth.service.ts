import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../usuarios/entities/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { JwtUser } from './types/jwt-usuario.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOneBy({ nickname: dto.nickname });
    if (!user) throw new UnauthorizedException('Credenciais invalidas');

    const passwordMatches = await bcrypt.compare(dto.password, user.password_hash);
    if (!passwordMatches) throw new UnauthorizedException('Credenciais invalidas');

    const payload: JwtUser = {
      sub: user.id,
      nickname: user.nickname,
      email: user.email,
      name: user.name,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      token_type: 'Bearer',
      user: payload,
    };
  }

  async validatePayload(payload: JwtUser): Promise<JwtUser> {
    const user = await this.usersRepo.findOneBy({ id: payload.sub });
    if (!user) throw new UnauthorizedException('Token invalido');

    return {
      sub: user.id,
      nickname: user.nickname,
      email: user.email,
      name: user.name,
    };
  }
}
