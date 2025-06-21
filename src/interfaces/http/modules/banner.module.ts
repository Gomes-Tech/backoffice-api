import {
  CreateBannerUseCase,
  DeleteBannerUseCase,
  FindAllBannersUseCase,
  FindBannerByIdUseCase,
  FindListBannersUseCase,
  UpdateBannerUseCase,
} from '@app/banner';
import { PrismaBannerRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';
import { BannerController } from '../controllers/banner';

@Module({
  imports: [],
  controllers: [BannerController],
  providers: [
    FindAllBannersUseCase,
    FindListBannersUseCase,
    FindBannerByIdUseCase,
    CreateBannerUseCase,
    UpdateBannerUseCase,
    DeleteBannerUseCase,
    PrismaBannerRepository,
    {
      provide: 'BannerRepository',
      useExisting: PrismaBannerRepository,
    },
  ],
  exports: [
    {
      provide: 'BannerRepository',
      useExisting: PrismaBannerRepository,
    },
  ],
})
export class BannerModule {}
