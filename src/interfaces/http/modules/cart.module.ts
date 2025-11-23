import {
  CreateCartItemUseCase,
  CreateCartUseCase,
  DeleteCartItemUseCase,
  DeleteCartUseCase,
  FindCartByCustomerIdUseCase,
  SyncCartUseCase,
  UpdateCartItemUseCase,
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
    DeleteCartItemUseCase,
    DeleteCartUseCase,
    PrismaCartRepository,
    {
      provide: 'CartRepository',
      useExisting: PrismaCartRepository,
    },
  ],
})
export class CartModule {}
