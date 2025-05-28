export type FindAllCategoriesFilter = {
  name?: string;
  page?: number;
  limit?: number;
  orderBy?: {
    field?: 'name' | 'createdAt' | 'isActive';
    direction?: 'asc' | 'desc';
  };
};
