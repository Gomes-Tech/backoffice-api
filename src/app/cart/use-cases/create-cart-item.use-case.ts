import { CartRepository } from '@domain/cart';
import { Inject, Injectable } from '@nestjs/common';
import { CreateCartUseCase } from './create-cart.use-case';
import { FindCartByCustomerIdUseCase } from './findCartByCustomerId.use-case';

@Injectable()
export class CreateCartItemUseCase {
  constructor(
    @Inject('CartRepository')
    private readonly cartRepository: CartRepository,
    private readonly findCartByCustomerIdUseCase: FindCartByCustomerIdUseCase,
    private readonly createCartUseCase: CreateCartUseCase,
  ) {}

  async execute(
    cartId: string,
    productVariantId: string,
    quantity: number,
  ): Promise<void> {
    return await this.cartRepository.addItem({
      cartId,
      productVariantId,
      quantity,
    });
  }
}
