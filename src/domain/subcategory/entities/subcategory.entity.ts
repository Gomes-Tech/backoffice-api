export class Subcategory {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public isActive: boolean,
    public createdAt: Date,
    public createdBy: string,
  ) {}
}

export class SubcategoryDetails extends Subcategory {
  constructor(
    id: string,
    name: string,
    slug: string,
    isActive: boolean,
    createdAt: Date,
    createdBy: string,
    public seoTitle: string,
    public seoDescription: string,
    public seoKeywords: string,
    public seoCanonicalUrl: string,
    public seoMetaRobots: string,
  ) {
    super(id, name, slug, isActive, createdAt, createdBy);
  }
}
