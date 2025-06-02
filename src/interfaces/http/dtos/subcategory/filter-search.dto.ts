export type FindAllSubCategoriesFilter = {
  name?: string;
  page?: number;
  limit?: number;
  orderBy?: {
    field?: 'name' | 'createdAt' | 'isActive';
    direction?: 'asc' | 'desc';
  };
};
