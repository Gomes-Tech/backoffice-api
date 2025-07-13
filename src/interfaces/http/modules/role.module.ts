import {
  CreateRoleUseCase,
  DeleteRoleUseCase,
  FindAllRoleUseCase,
  FindRoleByIdUseCase,
  UpdateRoleUseCase,
} from '@app/role';
import { PrismaRoleRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';
import { RoleController } from '../controllers';

@Module({
  imports: [],
  controllers: [RoleController],
  providers: [
    FindAllRoleUseCase,
    FindRoleByIdUseCase,
    CreateRoleUseCase,
    UpdateRoleUseCase,
    DeleteRoleUseCase,
    PrismaRoleRepository,
    {
      provide: 'RoleRepository',
      useExisting: PrismaRoleRepository,
    },
  ],
  exports: [
    FindAllRoleUseCase,
    FindRoleByIdUseCase,
    CreateRoleUseCase,
    UpdateRoleUseCase,
    DeleteRoleUseCase,
    PrismaRoleRepository,
    {
      provide: 'RoleRepository',
      useExisting: PrismaRoleRepository,
    },
  ],
})
export class RoleModule {}
