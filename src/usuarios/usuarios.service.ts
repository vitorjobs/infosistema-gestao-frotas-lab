import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USERS_REPOSITORY } from '../common/constants';
import { PaginatedResult } from '../common/pagination';
import { User } from './entities/usuario.entity';
import { IUsersRepository } from './usuarios.repository.interface';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly repo: IUsersRepository,
  ) {}

  async findAll(page: number, limit: number): Promise<PaginatedResult<User>> {
    return this.repo.findAll(page, limit);
  }

  async findById(id: number): Promise<User> {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException(`Usuario com id ${id} nao encontrado`);
    return user;
  }
}
