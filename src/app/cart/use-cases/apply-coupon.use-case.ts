import { CartRepository, ReturnCart } from '@domain/cart';
import { CouponRepository } from '@domain/coupon';
import { BadRequestException, NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';
import { FindCartByCustomerIdUseCase } from './findCartByCustomerId.use-case';

@Injectable()
export class ApplyCouponUseCase {
  constructor(
    @Inject('CartRepository')
    private readonly cartRepository: CartRepository,
    @Inject('CouponRepository')
    private readonly couponRepository: CouponRepository,
    private readonly findCartByCustomerIdUseCase: FindCartByCustomerIdUseCase,
  ) {}

  async execute(customerId: string, couponCode: string): Promise<ReturnCart> {
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

    if (
      !validation.isValid ||
      !validation.coupon ||
      !validation.discountAmount
    ) {
      throw new BadRequestException(validation.error || 'Cupom inválido');
    }

    // Aplica o cupom ao carrinho
    await this.couponRepository.applyToCart(
      cart.id,
      validation.coupon.id,
      validation.discountAmount,
    );

    // Incrementa o uso do cupom (será usado quando o pedido for finalizado)
    // Por enquanto apenas aplicamos ao carrinho

    // Busca o carrinho atualizado
    const updatedCart =
      await this.findCartByCustomerIdUseCase.execute(customerId);

    if (!updatedCart) {
      throw new NotFoundException('Erro ao buscar carrinho atualizado');
    }

    return updatedCart;
  }
}
