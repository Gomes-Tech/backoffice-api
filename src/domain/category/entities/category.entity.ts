export class BaseCategory {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public isActive: boolean,
    public showMenu: boolean,
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
    showMenu: boolean,
    public createdAt: Date,
    public createdBy: string,
  ) {
    super(id, name, slug, isActive, showMenu);
  }
}

export class CategoryDetails extends BaseCategory {
  constructor(
    id: string,
    name: string,
    slug: string,
    isActive: boolean,
    showMenu: boolean,
    public seoTitle: string,
    public seoDescription: string,
    public seoKeywords: string,
    public seoCanonicalUrl: string,
    public seoMetaRobots: string,
    public categoryFAQ: CategoryFAQ[],
    public categoryImageUrl?: string,
    public categoryImageKey?: string,
  ) {
    super(id, name, slug, isActive, showMenu);
  }
}

export class CreateCategory extends BaseCategory {
  constructor(
    id: string,
    name: string,
    slug: string,
    isActive: boolean,
    showMenu: boolean,
    parentId: string | undefined,
    public seoTitle: string,
    public seoDescription: string,
    public seoKeywords: string,
    public seoCanonicalUrl: string,
    public seoMetaRobots: string,
    public createdBy: string,
    public categoryImageUrl?: string,
    public categoryImageKey?: string,
  ) {
    super(id, name, slug, isActive, showMenu, parentId);
  }
}

class CategoryFAQ {
  constructor(
    public readonly id: string,
    public question: string,
    public answer: string,
  ) {}
}

export class UpdateCategory {
  constructor(
    public updatedBy: string,
    public name?: string,
    public slug?: string,
    public isActive?: boolean,
    public showMenu?: boolean,
    public seoTitle?: string,
    public seoDescription?: string,
    public seoKeywords?: string,
    public seoCanonicalUrl?: string,
    public seoMetaRobots?: string,
    public parentId?: string,
    public categoryImageUrl?: string,
    public categoryImageKey?: string,
  ) {}
}
