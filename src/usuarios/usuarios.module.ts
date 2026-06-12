import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { USERS_REPOSITORY } from '../common/constants';
import { User } from './entities/usuario.entity';
import { UsersController } from './usuarios.controller';
import { UsersRepository } from './usuarios.repository';
import { UsersService } from './usuarios.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: USERS_REPOSITORY,
      useClass: UsersRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
