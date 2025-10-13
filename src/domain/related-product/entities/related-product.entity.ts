export class RelatedProductEntity {
  constructor(
    public id: string,
    public productId: string,
  ) {}
}

export class CreateRelatedProduct extends RelatedProductEntity {
  constructor(id: string, productId: string) {
    super(id, productId);
  }
}
