import {
  CreateHeaderMenuUseCase,
  DeleteHeaderMenuUseCase,
  FindAllHeaderMenuUseCase,
  FindHeaderMenuByIdUseCase,
  UpdateHeaderMenuUseCase,
} from '@app/header-menu';
import { PrismaHeaderMenuRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';
import { HeaderMenuController } from '../controllers';

@Module({
  imports: [],
  controllers: [HeaderMenuController],
  providers: [
    FindAllHeaderMenuUseCase,
    FindHeaderMenuByIdUseCase,
    CreateHeaderMenuUseCase,
    UpdateHeaderMenuUseCase,
    DeleteHeaderMenuUseCase,
    PrismaHeaderMenuRepository,
    {
      provide: 'HeaderMenuRepository',
      useExisting: PrismaHeaderMenuRepository,
    },
  ],
  exports: [
    FindAllHeaderMenuUseCase,
    FindHeaderMenuByIdUseCase,
    CreateHeaderMenuUseCase,
    UpdateHeaderMenuUseCase,
    DeleteHeaderMenuUseCase,
    PrismaHeaderMenuRepository,
    {
      provide: 'HeaderMenuRepository',
      useExisting: PrismaHeaderMenuRepository,
    },
  ],
})
export class HeaderMenuModule {}
