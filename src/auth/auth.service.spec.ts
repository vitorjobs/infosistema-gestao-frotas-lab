import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../usuarios/entities/usuario.entity';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersRepo: { findOneBy: jest.Mock };
  let jwtService: { signAsync: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    usersRepo = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
  });

  it('returns a token for valid credentials', async () => {
    usersRepo.findOneBy.mockResolvedValue({
      id: 1,
      nickname: 'aivacol',
      name: 'Aivacol Admin',
      email: 'aivacol@example.com',
      password_hash: await bcrypt.hash('aivacol', 10),
    });
    jwtService.signAsync.mockResolvedValue('signed-token');

    await expect(service.login({ nickname: 'aivacol', password: 'aivacol' })).resolves.toEqual({
      access_token: 'signed-token',
      token_type: 'Bearer',
      user: {
        sub: 1,
        nickname: 'aivacol',
        name: 'Aivacol Admin',
        email: 'aivacol@example.com',
      },
    });
  });

  it('rejects invalid credentials', async () => {
    usersRepo.findOneBy.mockResolvedValue({
      id: 1,
      nickname: 'aivacol',
      name: 'Aivacol Admin',
      email: 'aivacol@example.com',
      password_hash: await bcrypt.hash('aivacol', 10),
    });

    await expect(service.login({ nickname: 'aivacol', password: 'wrong' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('validates an existing JWT payload', async () => {
    usersRepo.findOneBy.mockResolvedValue({
      id: 1,
      nickname: 'aivacol',
      name: 'Aivacol Admin',
      email: 'aivacol@example.com',
    });

    await expect(
      service.validatePayload({
        sub: 1,
        nickname: 'aivacol',
        name: 'Aivacol Admin',
        email: 'aivacol@example.com',
      }),
    ).resolves.toEqual({
      sub: 1,
      nickname: 'aivacol',
      name: 'Aivacol Admin',
      email: 'aivacol@example.com',
    });
  });
});
