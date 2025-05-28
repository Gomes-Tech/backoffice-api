import {
  CreateUserUseCase,
  FindUserByEmailUseCase,
  FindUserByIdUseCase,
  UpdateUserUseCase,
} from '@app/user';
import { PrismaUserRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [
    FindUserByIdUseCase,
    FindUserByEmailUseCase,
    CreateUserUseCase,
    PrismaUserRepository,
    UpdateUserUseCase,
    {
      provide: 'UserRepository',
      useExisting: PrismaUserRepository,
    },
  ],
  exports: [
    FindUserByIdUseCase,
    FindUserByEmailUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    PrismaUserRepository,
    {
      provide: 'UserRepository',
      useExisting: PrismaUserRepository,
    },
  ],
})
export class UserModule {}
