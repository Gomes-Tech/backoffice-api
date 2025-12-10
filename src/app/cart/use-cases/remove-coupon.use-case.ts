import { CartRepository, ReturnCart } from '@domain/cart';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';
import { FindCartByCustomerIdUseCase } from './findCartByCustomerId.use-case';
import { CouponRepository } from '@domain/coupon';

@Injectable()
export class RemoveCouponUseCase {
  constructor(
    @Inject('CartRepository')
    private readonly cartRepository: CartRepository,
    @Inject('CouponRepository')
    private readonly couponRepository: CouponRepository,
    private readonly findCartByCustomerIdUseCase: FindCartByCustomerIdUseCase,
  ) {}

  async execute(customerId: string): Promise<ReturnCart> {
    // Busca o carrinho do cliente
    const cart = await this.findCartByCustomerIdUseCase.execute(customerId);

    if (!cart) {
      throw new NotFoundException('Carrinho não encontrado');
    }

    // Remove o cupom do carrinho
    await this.couponRepository.removeFromCart(cart.id);

    // Busca o carrinho atualizado
    const updatedCart = await this.findCartByCustomerIdUseCase.execute(customerId);

    if (!updatedCart) {
      throw new NotFoundException('Erro ao buscar carrinho atualizado');
    }

    return updatedCart;
  }
}

