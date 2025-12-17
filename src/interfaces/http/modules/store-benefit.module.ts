import {
  CreateStoreBenefitUseCase,
  DeleteStoreBenefitUseCase,
  FindAllStoreBenefitUseCase,
  FindStoreBenefitByIdUseCase,
  ListStoreBenefitUseCase,
  UpdateStoreBenefitUseCase,
} from '@app/store-benefit';
import { PrismaStoreBenefitRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';
import { StoreBenefitController } from '../controllers';

@Module({
  imports: [],
  controllers: [StoreBenefitController],
  providers: [
    FindAllStoreBenefitUseCase,
    ListStoreBenefitUseCase,
    FindStoreBenefitByIdUseCase,
    CreateStoreBenefitUseCase,
    UpdateStoreBenefitUseCase,
    DeleteStoreBenefitUseCase,
    PrismaStoreBenefitRepository,
    {
      provide: 'StoreBenefitRepository',
      useExisting: PrismaStoreBenefitRepository,
    },
  ],
  exports: [
    FindAllStoreBenefitUseCase,
    ListStoreBenefitUseCase,
    FindStoreBenefitByIdUseCase,
    CreateStoreBenefitUseCase,
    UpdateStoreBenefitUseCase,
    DeleteStoreBenefitUseCase,
    PrismaStoreBenefitRepository,
    {
      provide: 'StoreBenefitRepository',
      useExisting: PrismaStoreBenefitRepository,
    },
  ],
})
export class StoreBenefitModule {}


