import { BaseFindFilters } from '@shared/utils';

export interface FindCategoriesFilters
  extends BaseFindFilters<CategoryFilter, CategoryOrderByFields> {}

type CategoryFilter = {
  name?: string; // Filtro opcional por nome da categoria
};

// Opcional: campos que podem ser ordenados
type CategoryOrderByFields = {
  name: string;
  createdAt: Date;
  isActive: boolean;
};
