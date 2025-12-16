import { Coupon, CreateCoupon, UpdateCoupon } from '../entities';

export abstract class CouponRepository {
  abstract findByCode(code: string);
  abstract findById(id: string);
  abstract findAll(): Promise<Coupon[]>;
  abstract create(coupon: CreateCoupon): Promise<Coupon>;
  abstract update(id: string, coupon: UpdateCoupon): Promise<Coupon>;
  abstract delete(id: string, deletedBy: string): Promise<void>;
  abstract validateCoupon(
    code: string,
    customerId: string,
    cartTotal: number,
  ): Promise<Coupon & { discountAmount: number }>;
  abstract incrementUsage(id: string, customerId: string): Promise<void>;
  abstract removeFromCart(cartId: string): Promise<void>;
  abstract applyToCart(
    cartId: string,
    couponId: string,
    discountAmount: number,
  ): Promise<void>;
}
