import {
  Coupon,
  CouponValidationResult,
  CreateCoupon,
  UpdateCoupon,
} from '../entities';

export abstract class CouponRepository {
  abstract findByCode(code: string): Promise<Coupon | null>;
  abstract findById(id: string): Promise<Coupon | null>;
  abstract findAll(): Promise<Coupon[]>;
  abstract create(coupon: CreateCoupon): Promise<Coupon>;
  abstract update(id: string, coupon: UpdateCoupon): Promise<Coupon>;
  abstract delete(id: string, deletedBy: string): Promise<void>;
  abstract validateCoupon(
    code: string,
    customerId: string,
    cartTotal: number,
  ): Promise<CouponValidationResult>;
  abstract incrementUsage(id: string, customerId: string): Promise<void>;
  abstract removeFromCart(cartId: string): Promise<void>;
  abstract applyToCart(
    cartId: string,
    couponId: string,
    discountAmount: number,
  ): Promise<void>;
}
