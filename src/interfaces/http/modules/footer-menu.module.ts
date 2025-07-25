import {
  CreateFooterMenuUseCase,
  DeleteFooterMenuUseCase,
  FindAllFooterMenuUseCase,
  FindFooterMenuByIdUseCase,
  GetAllFooterMenuUseCase,
  UpdateFooterMenuUseCase,
} from '@app/footer-menu';
import { PrismaFooterMenuRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';
import { FooterMenuController } from '../controllers';

@Module({
  imports: [],
  controllers: [FooterMenuController],
  providers: [
    FindAllFooterMenuUseCase,
    GetAllFooterMenuUseCase,
    FindFooterMenuByIdUseCase,
    CreateFooterMenuUseCase,
    UpdateFooterMenuUseCase,
    DeleteFooterMenuUseCase,
    PrismaFooterMenuRepository,
    {
      provide: 'FooterMenuRepository',
      useExisting: PrismaFooterMenuRepository,
    },
  ],
  exports: [
    {
      provide: 'FooterMenuRepository',
      useExisting: PrismaFooterMenuRepository,
    },
  ],
})
export class FooterMenuModule {}
