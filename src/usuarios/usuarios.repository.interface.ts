import { PaginatedResult } from '../common/pagination';
import { User } from './entities/usuario.entity';

export interface IUsersRepository {
  findAll(page: number, limit: number): Promise<PaginatedResult<User>>;
  findById(id: number): Promise<User | null>;
}
