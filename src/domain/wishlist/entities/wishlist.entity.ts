export class Wishlist {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly items: WishlistItem[],
  ) {}
}

export class WishlistItem {
  constructor(
    public readonly id: string,
    public readonly wishlistId: string,
    public readonly productId: string,
    public name: string,
    public slug: string,
    public price: number,
    public discountPrice: number,
    public isActive: boolean,
    public images: {
      desktopImageUrl: string;
      mobileImageUrl: string;
    },
  ) {}
}
