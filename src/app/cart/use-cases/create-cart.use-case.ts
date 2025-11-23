import { CartRepository } from '@domain/cart';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CreateCartUseCase {
  constructor(
    @Inject('CartRepository')
    private readonly cartRepository: CartRepository,
  ) {}

  async execute(customerId: string): Promise<{ id: string }> {
    return await this.cartRepository.createCart(customerId);
  }
}
