import { Coupon, CouponRepository } from '@domain/coupon';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAllCouponUseCase {
  constructor(
    @Inject('CouponRepository')
    private readonly couponRepository: CouponRepository,
  ) {}

  async execute(): Promise<Coupon[]> {
    return await this.couponRepository.findAll();
  }
}

