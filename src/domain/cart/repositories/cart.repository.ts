import { CartStatus } from '@prisma/client';
import { CreateCartItem, ReturnCart } from '../entities';

export abstract class CartRepository {
  abstract findCartByCustomerId(customerId: string): Promise<ReturnCart | null>;
  abstract addItem(item: CreateCartItem): Promise<void>;
  abstract createCart(customerId: string): Promise<{ id: string }>;
  abstract updateItemQuantity(
    cartItemId: string,
    quantity: number,
  ): Promise<void>;
  abstract removeItem(cartItemId: string): Promise<void>;
  abstract updateCartStatus(cartId: string, status: CartStatus): Promise<void>;
  abstract clearCart(cartId: string): Promise<void>;
}
