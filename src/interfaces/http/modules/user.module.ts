import {
  CreateUserUseCase,
  DeleteUserUseCase,
  FindAllUsersUseCase,
  FindUserByEmailUseCase,
  FindUserByIdUseCase,
  UpdateUserUseCase,
} from '@app/user';
import { PrismaUserRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';
import { UserController } from '../controllers/user';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [
    FindAllUsersUseCase,
    FindUserByIdUseCase,
    FindUserByEmailUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    PrismaUserRepository,
    {
      provide: 'UserRepository',
      useExisting: PrismaUserRepository,
    },
  ],
  exports: [
    FindAllUsersUseCase,
    FindUserByIdUseCase,
    FindUserByEmailUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    PrismaUserRepository,
    {
      provide: 'UserRepository',
      useExisting: PrismaUserRepository,
    },
  ],
})
export class UserModule {}
