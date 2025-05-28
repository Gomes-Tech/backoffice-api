import { PaginatedResponse } from '@interfaces/http';
import {
  Category,
  CategoryDetails,
  CreateCategory,
  FindCategoriesFilters,
  UpdateCategory,
} from '../entities';

export abstract class CategoryRepository {
  abstract findAll(
    filters?: FindCategoriesFilters,
  ): Promise<PaginatedResponse<Category>>;
  abstract findById(id: string): Promise<CategoryDetails | null>;
  abstract findBySlug(slug: string): Promise<CategoryDetails | null>;
  abstract create(category: CreateCategory): Promise<void>;
  abstract update(id: string, category: UpdateCategory): Promise<void>;
  abstract delete(id: string, userId: string): Promise<void>;
}
