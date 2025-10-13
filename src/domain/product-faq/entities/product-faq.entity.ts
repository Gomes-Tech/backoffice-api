export class ProductFAQEntity {
  constructor(
    public id: string,
    public question: string,
    public answer: string,
  ) {}
}

export class CreateProductFAQ {
  constructor(
    public id: string,
    public question: string,
    public answer: string,
    public productId: string,
  ) {}
}

export class UpdateProductFAQ {
  constructor(
    public question?: string,
    public answer?: string,
  ) {}
}
