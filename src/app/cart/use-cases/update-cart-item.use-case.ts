import { CartRepository } from '@domain/cart';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UpdateCartItemUseCase {
  constructor(
    @Inject('CartRepository')
    private readonly cartRepository: CartRepository,
  ) {}

  async execute(cartItemId: string, quantity: number): Promise<void> {
    return await this.cartRepository.updateItemQuantity(cartItemId, quantity);
  }
}
