import { CreateCartItem } from '@domain/cart';
import { Injectable } from '@nestjs/common';
import { CreateCartItemUseCase } from './create-cart-item.use-case';
import { CreateCartUseCase } from './create-cart.use-case';
import { FindCartByCustomerIdUseCase } from './findCartByCustomerId.use-case';
import { UpdateCartItemUseCase } from './update-cart-item.use-case';

@Injectable()
export class SyncCartUseCase {
  constructor(
    private readonly createCartUseCase: CreateCartUseCase,
    private readonly createCartItemUseCase: CreateCartItemUseCase,
    private readonly findCartByCustomerIdUseCase: FindCartByCustomerIdUseCase,
    private readonly updateCartItemUseCase: UpdateCartItemUseCase,
  ) {}

  async execute(
    customerId: string,
    items: Omit<CreateCartItem, 'cartId'>[],
  ): Promise<void> {
    const existingCart = await this.findCartByCustomerIdUseCase
      .execute(customerId)
      .catch(() => null);

    if (!existingCart) {
      const cart = await this.createCartUseCase.execute(customerId);

      for (const item of items) {
        await this.createCartItemUseCase.execute(
          cart.id,
          item.productVariantId,
          item.quantity,
        );
      }

      return;
    }

    for (const item of items) {
      const existingItem = existingCart.items.find(
        (i) => i.variantId === item.productVariantId,
      );

      if (!existingItem) {
        await this.createCartItemUseCase.execute(
          existingCart.id,
          item.productVariantId,
          item.quantity,
        );
      } else {
        await this.updateCartItemUseCase.execute(
          existingItem.id,
          item.quantity,
        );
      }
    }
  }
}
