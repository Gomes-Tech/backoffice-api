export class BaseSubCategory {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public isActive: boolean,
  ) {}
}

export class SubCategory extends BaseSubCategory {
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

export class SubCategoryDetails extends BaseSubCategory {
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

export class CreateSubCategory extends BaseSubCategory {
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
    public category: string,
    public createdBy: string,
  ) {
    super(id, name, slug, isActive);
  }
}

export class UpdateSubCategory {
  constructor(
    public updatedBy: string,
    public name?: string,
    public slug?: string,
    public isActive?: boolean,
    public seoTitle?: string,
    public seoDescription?: string,
    public seoKeywords?: string,
    public seoCanonicalUrl?: string,
    public category?: string,
    public seoMetaRobots?: string,
  ) {}
}
