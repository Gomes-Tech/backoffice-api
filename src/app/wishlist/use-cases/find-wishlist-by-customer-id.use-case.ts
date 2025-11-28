import { Wishlist, WishlistRepository } from '@domain/wishlist';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindWishlistByCustomerIdUseCase {
  constructor(
    @Inject('WishlistRepository')
    private readonly wishlistRepository: WishlistRepository,
  ) {}

  async execute(customerId: string): Promise<Wishlist> {
    return this.wishlistRepository.findByCustomerId(customerId);
  }
}
