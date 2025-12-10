import {
  CreateCouponUseCase,
  DeleteCouponUseCase,
  FindAllCouponUseCase,
  FindCouponByIdUseCase,
  UpdateCouponUseCase,
} from '@app/coupon';
import { PrismaCouponRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';
import { CouponController } from '../controllers';

@Module({
  imports: [],
  controllers: [CouponController],
  providers: [
    FindAllCouponUseCase,
    FindCouponByIdUseCase,
    CreateCouponUseCase,
    UpdateCouponUseCase,
    DeleteCouponUseCase,
    PrismaCouponRepository,
    {
      provide: 'CouponRepository',
      useExisting: PrismaCouponRepository,
    },
  ],
  exports: [
    {
      provide: 'CouponRepository',
      useExisting: PrismaCouponRepository,
    },
  ],
})
export class CouponModule {}
