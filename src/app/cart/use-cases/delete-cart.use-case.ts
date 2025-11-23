import { CartRepository } from '@domain/cart';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteCartUseCase {
  constructor(
    @Inject('CartRepository')
    private readonly cartRepository: CartRepository,
  ) {}

  async execute(cartId: string): Promise<void> {
    return await this.cartRepository.clearCart(cartId);
  }
}
