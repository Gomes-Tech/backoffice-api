import { WishlistRepository } from '@domain/wishlist';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class RemoveWishlistItemUseCase {
  constructor(
    @Inject('WishlistRepository')
    private readonly wishlistRepository: WishlistRepository,
  ) {}

  async execute(wishlistItemId: string): Promise<void> {
    return await this.wishlistRepository.removeItem(wishlistItemId);
  }
}
