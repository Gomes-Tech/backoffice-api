import {
  Coupon,
  CouponRepository,
  CouponStatus,
  CouponType,
  UpdateCoupon,
} from '@domain/coupon';
import { BadRequestException, NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UpdateCouponUseCase {
  constructor(
    @Inject('CouponRepository')
    private readonly couponRepository: CouponRepository,
  ) {}

  async execute(
    id: string,
    data: {
      code?: string;
      description?: string;
      type?: 'PERCENTAGE' | 'FIXED';
      value?: number;
      minPurchaseAmount?: number;
      maxDiscountAmount?: number;
      usageLimit?: number;
      isSingleUse?: boolean;
      startDate?: Date;
      endDate?: Date | null;
      status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
      updatedBy: string;
    },
  ): Promise<Coupon> {
    const existing = await this.couponRepository.findById(id);

    if (!existing) {
      throw new NotFoundException('Cupom não encontrado');
    }

    // Se estiver alterando o código, verifica se já existe outro com o mesmo código
    if (data.code && data.code !== existing.code) {
      const codeExists = await this.couponRepository.findByCode(data.code);
      if (codeExists) {
        throw new BadRequestException('Já existe um cupom com este código');
      }
    }

    // Valida datas se ambas forem fornecidas
    if (
      data.startDate &&
      data.endDate !== undefined &&
      data.endDate !== null &&
      data.endDate <= data.startDate
    ) {
      throw new BadRequestException(
        'Data de término deve ser posterior à data de início',
      );
    }

    const updateData = new UpdateCoupon(
      data.updatedBy,
      data.code,
      data.description,
      data.type as CouponType | undefined,
      data.value,
      data.minPurchaseAmount,
      data.maxDiscountAmount,
      data.usageLimit,
      data.isSingleUse,
      data.startDate,
      data.endDate,
      data.status as CouponStatus | undefined,
    );

    return await this.couponRepository.update(id, updateData);
  }
}
