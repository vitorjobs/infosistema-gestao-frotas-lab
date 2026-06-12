import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { toPaginatedResult } from '../common/pagination';
import { User } from './entities/usuario.entity';
import { IUsersRepository } from './usuarios.repository.interface';

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
      select: ['id', 'nickname', 'name', 'email', 'created_by', 'created_at', 'updated_at'],
    });
    return toPaginatedResult(items, total, page, limit);
  }

  async findById(id: number): Promise<User | null> {
    return this.repo.findOne({
      where: { id },
      select: ['id', 'nickname', 'name', 'email', 'created_by', 'created_at', 'updated_at'],
    });
  }
}
