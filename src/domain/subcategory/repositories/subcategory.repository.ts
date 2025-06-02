import { PaginatedResponse } from '@interfaces/http';
import {
  CreateSubCategory,
  FindSubCategoriesFilters,
  SubCategory,
  SubCategoryDetails,
  UpdateSubCategory,
} from '../entities';

export abstract class SubCategoryRepository {
  abstract findAll(
    filters?: FindSubCategoriesFilters,
  ): Promise<PaginatedResponse<SubCategory>>;
  abstract findById(id: string): Promise<SubCategoryDetails | null>;
  abstract findBySlug(slug: string): Promise<SubCategoryDetails | null>;
  abstract create(category: CreateSubCategory): Promise<void>;
  abstract update(id: string, category: UpdateSubCategory): Promise<void>;
  abstract delete(id: string, userId: string): Promise<void>;
}
