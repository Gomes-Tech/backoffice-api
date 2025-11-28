import { WishlistRepository } from '@domain/wishlist';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CreateWishlistItemUseCase {
  constructor(
    @Inject('WishlistRepository')
    private readonly wishlistRepository: WishlistRepository,
  ) {}

  async execute(
    wishlistId: string,
    productId: string,
    customerId: string,
  ): Promise<void> {
    const wishlist = await this.wishlistRepository.findByCustomerId(customerId);

    if (!wishlist) {
      const newWishlist = await this.wishlistRepository.create(customerId);
      wishlistId = newWishlist.id;
    }

    return this.wishlistRepository.addItem(wishlistId, productId);
  }
}
