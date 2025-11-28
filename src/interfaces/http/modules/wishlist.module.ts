import {
  CreateWishlistItemUseCase,
  CreateWishlistUseCase,
  FindWishlistByCustomerIdUseCase,
  RemoveWishlistByCustomerIdUseCase,
  RemoveWishlistItemUseCase,
} from '@app/wishlist';
import { PrismaWishlistRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';
import { WishlistController } from '../controllers/wishlist';

@Module({
  imports: [],
  controllers: [WishlistController],
  providers: [
    FindWishlistByCustomerIdUseCase,
    CreateWishlistItemUseCase,
    CreateWishlistUseCase,
    RemoveWishlistItemUseCase,
    RemoveWishlistByCustomerIdUseCase,
    PrismaWishlistRepository,
    {
      provide: 'WishlistRepository',
      useExisting: PrismaWishlistRepository,
    },
  ],
  exports: [
    FindWishlistByCustomerIdUseCase,
    CreateWishlistItemUseCase,
    CreateWishlistUseCase,
    RemoveWishlistItemUseCase,
    RemoveWishlistByCustomerIdUseCase,
    PrismaWishlistRepository,
    {
      provide: 'WishlistRepository',
      useExisting: PrismaWishlistRepository,
    },
  ],
})
export class WishlistModule {}
