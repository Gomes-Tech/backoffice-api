export class SimilarProductEntity {
  constructor(
    public id: string,
    public productId: string,
  ) {}
}

export class CreateSimilarProduct extends SimilarProductEntity {
  constructor(id: string, productId: string) {
    super(id, productId);
  }
}
