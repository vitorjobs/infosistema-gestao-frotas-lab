import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsSelect, Repository } from 'typeorm';
import { toPaginatedResult } from '../common/pagination';
import { User } from './entities/usuario.entity';
import { IUsersRepository } from './usuarios.repository.interface';

const USER_PUBLIC_SELECT: FindOptionsSelect<User> = {
  id: true,
  nickname: true,
  name: true,
  email: true,
  created_by: true,
  created_at: true,
  updated_at: true,
};

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async findAll(page: number, limit: number) {
    const [items, total] = await this.repo.findAndCount({
      order: { id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
      select: USER_PUBLIC_SELECT,
    });
    return toPaginatedResult(items, total, page, limit);
  }

  async findById(id: number): Promise<User | null> {
    return this.repo.findOne({
      where: { id },
      select: USER_PUBLIC_SELECT,
    });
  }
}
