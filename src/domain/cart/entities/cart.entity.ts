export class Cart {
  constructor(
    public readonly id: string,
    public customerId: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}

export class CartItem {
  constructor(
    public readonly id: string,
    public cartId: string,
    public productVariantId: string,
    public quantity: number,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}

export class ReturnCart {
  constructor(
    public readonly id: string,
    public customerId: string,
    public items: ReturnCartItem[],
    public total: number,
    public discountAmount?: number,
    public totalWithDiscount?: number,
    public couponCode?: string,
  ) {}
}

export class ReturnCartItem {
  constructor(
    public readonly id: string,
    public variantId: string,
    public slug: string,
    public name: string,
    public price: number,
    public quantity: number,
    public subtotal: number,
    public images: {
      desktopImageUrl?: string;
      mobileImageUrl?: string;
    },
    public attributes: {
      id: string;
      attributeValue: {
        id: string;
        name: string;
        value: string;
        attribute: {
          id: string;
          name: string;
        };
      };
    }[],
    public discountPrice?: string,
    public discountPix?: string,
  ) {}
}

export class CreateCartItem {
  constructor(
    public cartId: string,
    public productVariantId: string,
    public quantity: number,
  ) {}
}

export class UpdateCartItem {
  constructor(public quantity: number) {}
}
