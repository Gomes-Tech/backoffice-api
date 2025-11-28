import { WishlistRepository } from '@domain/wishlist';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class RemoveWishlistByCustomerIdUseCase {
  constructor(
    @Inject('WishlistRepository')
    private readonly wishlistRepository: WishlistRepository,
  ) {}

  async execute(customerId: string): Promise<void> {
    return await this.wishlistRepository.clear(customerId);
  }
}
