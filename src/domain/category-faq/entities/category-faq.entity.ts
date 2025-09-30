export class CategoryFAQ {
  constructor(
    public readonly id: string,
    public question: string,
    public answer: string,
  ) {}
}

export class CreateCategoryFAQ extends CategoryFAQ {
  constructor(
    id: string,
    question: string,
    answer: string,
    public categoryId: string,
  ) {
    super(id, question, answer);
  }
}

export class UpdateCategoryFAQ {
  constructor(
    public question?: string,
    public answer?: string,
  ) {}
}
