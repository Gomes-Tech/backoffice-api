import { BaseFindFilters } from '@shared/utils';

export interface FindSubCategoriesFilters
  extends BaseFindFilters<SubCategoryFilter, SubCategoryOrderByFields> {}

type SubCategoryFilter = {
  name?: string; // Filtro opcional por nome da categoria
};

// Opcional: campos que podem ser ordenados
type SubCategoryOrderByFields = {
  name: string;
  createdAt: Date;
  isActive: boolean;
};
