import {
  Coupon,
  CouponRepository,
  CouponStatus,
  CouponType,
  CreateCoupon,
  UpdateCoupon,
} from '@domain/coupon';
import { BadRequestException, NotFoundException } from '@infra/filters';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaCouponRepository extends CouponRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async findAll(): Promise<Coupon[]> {
    const coupons = await this.prismaService.coupon.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        code: true,
        description: true,
        type: true,
        value: true,
        isActive: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        createdBy: {
          select: {
            name: true,
          },
        },
        minPurchaseAmount: true,
        maxDiscountAmount: true,
        usageLimit: true,
        usageCount: true,
        isSingleUse: true,
        status: true,
      },
    });

    const data = coupons.map((coupon) => ({
      ...coupon,
      createdBy: coupon.createdBy?.name,
      type: coupon.type as CouponType,
      status: coupon.status as CouponStatus,
    }));

    return data;
  }

  async findByCode(code: string) {
    const coupon = await this.prismaService.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        isDeleted: false,
      },
      select: {
        id: true,
        code: true,
        description: true,
        type: true,
        value: true,
        isActive: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        createdBy: {
          select: {
            name: true,
          },
        },
        minPurchaseAmount: true,
        maxDiscountAmount: true,
        usageLimit: true,
        usageCount: true,
        isSingleUse: true,
        status: true,
        usedBy: true,
      },
    });

    if (!coupon) return null;

    return coupon;
  }

  async findById(id: string) {
    try {
      const coupon = await this.prismaService.coupon.findFirst({
        where: {
          id,
          isDeleted: false,
        },
        select: {
          id: true,
          code: true,
          description: true,
          type: true,
          value: true,
          isActive: true,
          isSingleUse: true,
          usageLimit: true,
          startDate: true,
          endDate: true,
          createdAt: true,
          createdBy: {
            select: {
              name: true,
            },
          },
          minPurchaseAmount: true,
          maxDiscountAmount: true,
        },
      });

      if (!coupon) {
        throw new NotFoundException('Cupom não encontrado');
      }

      return coupon;
    } catch (error) {
      throw new BadRequestException('Erro ao buscar cupom');
    }
  }

  async create(coupon: CreateCoupon): Promise<Coupon> {
    try {
      const created = await this.prismaService.coupon.create({
        data: {
          id: coupon.id,
          code: coupon.code.toUpperCase(),
          description: coupon.description,
          type: coupon.type,
          value: coupon.value,
          minPurchaseAmount: coupon.minPurchaseAmount,
          maxDiscountAmount: coupon.maxDiscountAmount,
          usageLimit: coupon.usageLimit,
          isSingleUse: coupon.isSingleUse,
          startDate: coupon.startDate,
          endDate: coupon.endDate ?? null,
          status: CouponStatus.ACTIVE,
          createdById: coupon.createdBy,
        },
      });

      return this.mapToEntity(created);
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Erro ao criar cupom');
    }
  }

  async update(id: string, coupon: UpdateCoupon): Promise<Coupon> {
    try {
      const existing = await this.prismaService.coupon.findFirst({
        where: { id, isDeleted: false },
      });

      if (!existing) {
        throw new NotFoundException('Cupom não encontrado');
      }

      const updated = await this.prismaService.coupon.update({
        where: { id },
        data: {
          code: coupon.code ? coupon.code.toUpperCase() : undefined,
          description: coupon.description,
          type: coupon.type,
          value: coupon.value,
          isActive: coupon.isActive,
          minPurchaseAmount: coupon.minPurchaseAmount,
          maxDiscountAmount: coupon.maxDiscountAmount,
          usageLimit: coupon.usageLimit,
          isSingleUse: coupon.isSingleUse,
          startDate: coupon.startDate,
          endDate: coupon.endDate,
          status: coupon.status,
          updatedById: coupon.updatedBy,
        },
      });

      return this.mapToEntity(updated);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.log(error);
      throw new BadRequestException('Erro ao atualizar cupom');
    }
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    try {
      const existing = await this.prismaService.coupon.findFirst({
        where: { id, isDeleted: false },
      });

      if (!existing) {
        throw new NotFoundException('Cupom não encontrado');
      }

      await this.prismaService.coupon.update({
        where: { id },
        data: {
          isActive: false,
          status: CouponStatus.INACTIVE,
          isDeleted: true,
          deletedById: deletedBy,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.log(error);
      throw new BadRequestException('Erro ao deletar cupom');
    }
  }

  async validateCoupon(
    code: string,
    customerId: string,
    cartTotal: number,
  ): Promise<Coupon & { discountAmount: number }> {
    const coupon = await this.findByCode(code);

    if (!coupon) {
      throw new BadRequestException('Cupom não encontrado');
    }

    // Verifica se está ativo
    if (coupon.status !== CouponStatus.ACTIVE) {
      throw new BadRequestException('Cupom não está ativo');
    }

    // Verifica data de validade
    const now = new Date();
    if (now < coupon.startDate) {
      throw new BadRequestException('Cupom ainda não está válido');
    }

    // Se tiver data de término, verifica se não expirou
    if (coupon.endDate && now > coupon.endDate) {
      throw new BadRequestException('Cupom expirado');
    }

    // Verifica limite de uso
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestException('Cupom esgotado');
    }

    // Verifica uso único por cliente
    if (coupon.isSingleUse && coupon.usedBy.includes(customerId)) {
      throw new BadRequestException('Você já utilizou este cupom');
    }

    // Verifica valor mínimo de compra
    if (coupon.minPurchaseAmount && cartTotal < coupon.minPurchaseAmount) {
      throw new BadRequestException(
        `Valor mínimo de compra: R$ ${(coupon.minPurchaseAmount / 100).toFixed(2)}`,
      );
    }

    // Calcula desconto
    let discountAmount = 0;

    if (coupon.type === CouponType.PERCENTAGE) {
      discountAmount = Math.round((cartTotal * coupon.value) / 100);
      // Aplica limite máximo de desconto se existir
      if (
        coupon.maxDiscountAmount &&
        discountAmount > coupon.maxDiscountAmount
      ) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else if (coupon.type === CouponType.FIXED) {
      discountAmount = coupon.value;
      // Não pode descontar mais que o valor do carrinho
      if (discountAmount > cartTotal) {
        discountAmount = cartTotal;
      }
    }

    return {
      ...coupon,
      discountAmount,
      type: coupon.type as CouponType,
      status: coupon.status as CouponStatus,
      createdBy: coupon.createdBy?.name,
    };
  }

  async incrementUsage(id: string, customerId: string): Promise<void> {
    try {
      const coupon = await this.prismaService.coupon.findUnique({
        where: { id },
      });

      if (!coupon) {
        throw new NotFoundException('Cupom não encontrado');
      }

      const usedBy = coupon.usedBy || [];
      if (!usedBy.includes(customerId)) {
        usedBy.push(customerId);
      }

      await this.prismaService.coupon.update({
        where: { id },
        data: {
          usageCount: { increment: 1 },
          usedBy,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.log(error);
      throw new BadRequestException('Erro ao incrementar uso do cupom');
    }
  }

  async removeFromCart(cartId: string): Promise<void> {
    try {
      await this.prismaService.cart.update({
        where: { id: cartId },
        data: {
          couponId: null,
          discountAmount: null,
        },
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Erro ao remover cupom do carrinho');
    }
  }

  async applyToCart(
    cartId: string,
    couponId: string,
    discountAmount: number,
  ): Promise<void> {
    try {
      await this.prismaService.cart.update({
        where: { id: cartId },
        data: {
          couponId,
          discountAmount,
        },
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Erro ao aplicar cupom ao carrinho');
    }
  }

  private mapToEntity(coupon: any): Coupon {
    return new Coupon(
      coupon.id,
      coupon.code,
      coupon.type as CouponType,
      coupon.value,
      coupon.startDate,
      coupon.isActive,
      coupon.usageCount,
      coupon.isSingleUse,
      coupon.status as CouponStatus,
      coupon.endDate,
      coupon.createdAt,
      coupon.createdBy,
      coupon.description,
      coupon.minPurchaseAmount,
      coupon.maxDiscountAmount,
      coupon.usageLimit,
    );
  }
}
