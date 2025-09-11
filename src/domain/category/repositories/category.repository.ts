import { BaseRepository } from '@domain/common';
import {
  CategoryDetails,
  CategoryList,
  CategoryTree,
  CreateCategory,
  UpdateCategory,
} from '../entities';

export abstract class CategoryRepository extends BaseRepository<
  CategoryDetails,
  CreateCategory,
  UpdateCategory,
  CategoryList
> {
  abstract findCategoryTree(): Promise<CategoryTree[]>;
  abstract findBySlug(slug: string): Promise<any>;
}
