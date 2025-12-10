import {
  ApplyCouponUseCase,
  CreateCartItemUseCase,
  CreateCartUseCase,
  DeleteCartItemUseCase,
  DeleteCartUseCase,
  FindCartByCustomerIdUseCase,
  RemoveCouponUseCase,
  SyncCartUseCase,
  UpdateCartItemUseCase,
  UpdateCartStatusUseCase,
} from '@app/cart';
import { PrismaCartRepository, PrismaCouponRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';
import { CartController } from '../controllers';

@Module({
  imports: [],
  controllers: [CartController],
  providers: [
    CreateCartUseCase,
    CreateCartItemUseCase,
    FindCartByCustomerIdUseCase,
    SyncCartUseCase,
    UpdateCartItemUseCase,
    UpdateCartStatusUseCase,
    DeleteCartItemUseCase,
    DeleteCartUseCase,
    ApplyCouponUseCase,
    RemoveCouponUseCase,
    PrismaCartRepository,
    PrismaCouponRepository,
    {
      provide: 'CartRepository',
      useExisting: PrismaCartRepository,
    },
    {
      provide: 'CouponRepository',
      useExisting: PrismaCouponRepository,
    },
  ],
  exports: [
    UpdateCartStatusUseCase,
    {
      provide: 'CartRepository',
      useExisting: PrismaCartRepository,
    },
  ],
})
export class CartModule {}
