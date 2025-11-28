import { WishlistRepository } from '@domain/wishlist';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CreateWishlistUseCase {
  constructor(
    @Inject('WishlistRepository')
    private readonly wishlistRepository: WishlistRepository,
  ) {}

  async execute(customerId: string): Promise<{ id: string }> {
    return this.wishlistRepository.create(customerId);
  }
}
