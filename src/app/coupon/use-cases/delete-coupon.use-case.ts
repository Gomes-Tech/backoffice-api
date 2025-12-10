import { CouponRepository } from '@domain/coupon';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteCouponUseCase {
  constructor(
    @Inject('CouponRepository')
    private readonly couponRepository: CouponRepository,
  ) {}

  async execute(id: string, deletedBy: string): Promise<void> {
    const existing = await this.couponRepository.findById(id);

    if (!existing) {
      throw new NotFoundException('Cupom não encontrado');
    }

    await this.couponRepository.delete(id, deletedBy);
  }
}
