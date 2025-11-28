import {
  CreateCartItemUseCase,
  CreateCartUseCase,
  DeleteCartItemUseCase,
  DeleteCartUseCase,
  FindCartByCustomerIdUseCase,
  SyncCartUseCase,
  UpdateCartItemUseCase,
  UpdateCartStatusUseCase,
} from '@app/cart';
import { PrismaCartRepository } from '@infra/prisma';
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
    PrismaCartRepository,
    {
      provide: 'CartRepository',
      useExisting: PrismaCartRepository,
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
