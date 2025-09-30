import { BaseRepository } from '@domain/common';
import { CategoryFAQ, CreateCategoryFAQ, UpdateCategoryFAQ } from '../entities';

export abstract class CategoryFAQRepository extends BaseRepository<
  CategoryFAQ,
  CreateCategoryFAQ,
  UpdateCategoryFAQ,
  CategoryFAQ
> {}
