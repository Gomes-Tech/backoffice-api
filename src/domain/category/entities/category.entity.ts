export class BaseCategory {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public isActive: boolean,
    public parentId?: string,
  ) {}
}

export type CategoryList = Pick<BaseCategory, 'id' | 'name' | 'parentId'> & {
  children: CategoryList[];
};

export type CategoryTree = BaseCategory & {
  children: CategoryList[];
};

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

export class CreateCategory extends BaseCategory {
  constructor(
    id: string,
    name: string,
    slug: string,
    isActive: boolean,
    parentId: string | undefined,
    public seoTitle: string,
    public seoDescription: string,
    public seoKeywords: string,
    public seoCanonicalUrl: string,
    public seoMetaRobots: string,
    public createdBy: string,
  ) {
    super(id, name, slug, isActive, parentId);
  }
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
    public parentId?: string,
  ) {}
}
