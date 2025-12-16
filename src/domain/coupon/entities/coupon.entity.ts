export enum CouponType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export enum CouponStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
}

export class Coupon {
  constructor(
    public readonly id: string,
    public code: string,
    public type: CouponType,
    public value: number, // Valor do desconto (percentual ou fixo em centavos)
    public startDate: Date,
    public isActive: boolean = true,
    public usageCount: number = 0, // Quantidade de vezes usado
    public isSingleUse: boolean = false, // Se true, cada cliente pode usar apenas uma vez
    public status: CouponStatus = CouponStatus.ACTIVE,
    public endDate: Date | null,
    public createdAt: Date,
    public createdBy: string,
    public description?: string,
    public minPurchaseAmount?: number, // Valor mínimo de compra em centavos
    public maxDiscountAmount?: number, // Valor máximo de desconto em centavos (para percentual)
    public usageLimit?: number, // Limite de uso total
  ) {}
}

export class CreateCoupon {
  constructor(
    public id: string,
    public code: string,
    public type: CouponType,
    public value: number,
    public startDate: Date,
    public endDate: Date | null,
    public createdBy: string,
    public description?: string,
    public minPurchaseAmount?: number,
    public maxDiscountAmount?: number,
    public usageLimit?: number,
    public isSingleUse: boolean = false,
  ) {}
}

export class UpdateCoupon {
  constructor(
    public updatedBy: string,
    public code?: string,
    public description?: string,
    public type?: CouponType,
    public value?: number,
    public minPurchaseAmount?: number,
    public maxDiscountAmount?: number,
    public usageLimit?: number,
    public isSingleUse?: boolean,
    public startDate?: Date,
    public endDate?: Date | null,
    public status?: CouponStatus,
    public isActive?: boolean,
  ) {}
}

export class CouponValidationResult {
  constructor(
    public isValid: boolean,
    public coupon?: Coupon,
    public error?: string,
    public discountAmount?: number, // Valor calculado do desconto em centavos
  ) {}
}
