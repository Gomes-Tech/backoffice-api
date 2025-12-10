import { Coupon, CouponRepository } from '@domain/coupon';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindCouponByIdUseCase {
  constructor(
    @Inject('CouponRepository')
    private readonly couponRepository: CouponRepository,
  ) {}

  async execute(id: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findById(id);

    if (!coupon) {
      throw new NotFoundException('Cupom não encontrado');
    }

    return coupon;
  }
}

