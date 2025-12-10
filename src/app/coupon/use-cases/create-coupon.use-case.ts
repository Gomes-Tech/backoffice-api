import {
  Coupon,
  CouponRepository,
  CouponType,
  CreateCoupon,
} from '@domain/coupon';
import { BadRequestException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';
import { generateId } from '@shared/utils';

@Injectable()
export class CreateCouponUseCase {
  constructor(
    @Inject('CouponRepository')
    private readonly couponRepository: CouponRepository,
  ) {}

  async execute(data: {
    code: string;
    description?: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    minPurchaseAmount?: number;
    maxDiscountAmount?: number;
    usageLimit?: number;
    isSingleUse?: boolean;
    startDate: Date;
    endDate?: Date | null;
    createdBy: string;
  }): Promise<Coupon> {
    // Verifica se já existe um cupom com o mesmo código
    const existing = await this.couponRepository.findByCode(data.code);

    if (existing) {
      throw new BadRequestException('Já existe um cupom com este código');
    }

    // Valida datas (se endDate fornecida)
    if (data.endDate && data.endDate <= data.startDate) {
      throw new BadRequestException(
        'Data de término deve ser posterior à data de início',
      );
    }

    const coupon = new CreateCoupon(
      generateId(),
      data.code,
      data.type as CouponType,
      data.value,
      data.startDate,
      data.endDate ?? null,
      data.createdBy,
      data.description,
      data.minPurchaseAmount,
      data.maxDiscountAmount,
      data.usageLimit,
      data.isSingleUse ?? false,
    );

    return await this.couponRepository.create(coupon);
  }
}
