import { Wishlist } from '../entities';

export abstract class WishlistRepository {
  abstract findByCustomerId(customerId: string): Promise<Wishlist>;
  abstract create(customerId: string): Promise<{ id: string }>;
  abstract addItem(id: string, productId: string): Promise<void>;
  abstract removeItem(itemId: string): Promise<void>;
  abstract clear(customerId: string): Promise<void>;
}
