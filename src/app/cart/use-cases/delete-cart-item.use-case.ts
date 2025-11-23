import { CartRepository } from '@domain/cart';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteCartItemUseCase {
  constructor(
    @Inject('CartRepository')
    private readonly cartRepository: CartRepository,
  ) {}

  async execute(cartItemId: string): Promise<void> {
    return await this.cartRepository.removeItem(cartItemId);
  }
}
