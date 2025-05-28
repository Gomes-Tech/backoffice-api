export class BaseCategory {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public isActive: boolean,
  ) {}
}

export class Category extends BaseCategory {
  constructor(
    id: string,
    name: string,
    slug: string,
    isActive: boolean,
    public createdAt: Date,
    public createdBy: string,
  ) {
    super(id, name, slug, isActive);
  }
}

export class CategoryDetails extends BaseCategory {
  constructor(
    id: string,
    name: string,
    slug: string,
    isActive: boolean,
    public seoTitle: string,
    public seoDescription: string,
    public seoKeywords: string,
    public seoCanonicalUrl: string,
    public seoMetaRobots: string,
  ) {
    super(id, name, slug, isActive);
  }
}

export class CreateCategory {
  constructor(
    public name: string,
    public slug: string,
    public isActive: boolean,
    public seoTitle: string,
    public seoDescription: string,
    public seoKeywords: string,
    public seoCanonicalUrl: string,
    public seoMetaRobots: string,
    public createdBy: string,
  ) {}
}

export class UpdateCategory {
  constructor(
    public updatedBy: string,
    public name?: string,
    public slug?: string,
    public isActive?: boolean,
    public seoTitle?: string,
    public seoDescription?: string,
    public seoKeywords?: string,
    public seoCanonicalUrl?: string,
    public seoMetaRobots?: string,
  ) {}
}
