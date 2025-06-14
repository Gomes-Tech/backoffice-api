import {
  CategoryDetails,
  CategoryList,
  CategoryTree,
  CreateCategory,
  UpdateCategory,
} from '../entities';

export abstract class CategoryRepository {
  abstract findAll(): Promise<CategoryList[]>;
  abstract findCategoryTree(): Promise<CategoryTree[]>;
  abstract findById(id: string): Promise<CategoryDetails | null>;
  abstract findBySlug(slug: string): Promise<CategoryDetails | null>;
  abstract create(category: CreateCategory): Promise<void>;
  abstract update(id: string, category: UpdateCategory): Promise<void>;
  abstract delete(id: string, userId: string): Promise<void>;
}
