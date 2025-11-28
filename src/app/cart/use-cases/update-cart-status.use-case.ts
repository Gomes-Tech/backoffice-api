import { CartRepository } from '@domain/cart';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';
import { CartStatus } from '@prisma/client';
import { FindCartByCustomerIdUseCase } from './findCartByCustomerId.use-case';

@Injectable()
export class UpdateCartStatusUseCase {
  constructor(
    @Inject('CartRepository')
    private readonly cartRepository: CartRepository,
    private readonly findCartByCustomerId: FindCartByCustomerIdUseCase,
  ) {}

  async execute(cartId: string, status: CartStatus): Promise<void> {
    const cart = await this.findCartByCustomerId.execute(cartId);

    if (!cart) {
      throw new NotFoundException('Carrinho não encontrado');
    }

    return await this.cartRepository.updateCartStatus(cartId, status);
  }
}
