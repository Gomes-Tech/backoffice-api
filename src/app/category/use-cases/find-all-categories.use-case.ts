import {
  Category,
  CategoryRepository,
  FindCategoriesFilters,
} from '@domain/category';
import { PaginatedResponse } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAllCategoriesUseCase {
  constructor(
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(
    filters?: FindCategoriesFilters,
  ): Promise<PaginatedResponse<Category>> {
    return await this.categoryRepository.findAll(filters);
  }
}
