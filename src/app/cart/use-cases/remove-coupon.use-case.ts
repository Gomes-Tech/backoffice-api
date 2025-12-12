import { CouponRepository } from '@domain/coupon';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';
import { FindCartByCustomerIdUseCase } from './findCartByCustomerId.use-case';

@Injectable()
export class RemoveCouponUseCase {
  constructor(
    @Inject('CouponRepository')
    private readonly couponRepository: CouponRepository,
    private readonly findCartByCustomerIdUseCase: FindCartByCustomerIdUseCase,
  ) {}

  async execute(customerId: string): Promise<void> {
    // Busca o carrinho do cliente
    const cart = await this.findCartByCustomerIdUseCase.execute(customerId);

    if (!cart) {
      throw new NotFoundException('Carrinho não encontrado');
    }

    // Remove o cupom do carrinho
    await this.couponRepository.removeFromCart(cart.id);
  }
}
