import { CouponRepository } from '@domain/coupon';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';
import { FindCartByCustomerIdUseCase } from './findCartByCustomerId.use-case';

@Injectable()
export class ApplyCouponUseCase {
  constructor(
    @Inject('CouponRepository')
    private readonly couponRepository: CouponRepository,
    private readonly findCartByCustomerIdUseCase: FindCartByCustomerIdUseCase,
  ) {}

  async execute(customerId: string, couponCode: string): Promise<void> {
    // Busca o carrinho do cliente
    const cart = await this.findCartByCustomerIdUseCase.execute(customerId);

    if (!cart) {
      throw new NotFoundException('Carrinho não encontrado');
    }

    // Calcula o total do carrinho (sem desconto)
    const cartTotal = cart.total;

    // Valida o cupom
    const validation = await this.couponRepository.validateCoupon(
      couponCode,
      customerId,
      cartTotal,
    );

    // Aplica o cupom ao carrinho
    await this.couponRepository.applyToCart(
      cart.id,
      validation.id,
      validation.discountAmount,
    );
  }
}
