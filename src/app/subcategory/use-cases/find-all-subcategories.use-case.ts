import { FindCategoriesFilters } from '@domain/category';
import { SubCategory, SubCategoryRepository } from '@domain/subcategory';
import { PaginatedResponse } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAllSubCategoriesUseCase {
  constructor(
    @Inject('SubCategoryRepository')
    private readonly subCategoryRepository: SubCategoryRepository,
  ) {}

  async execute(
    filters?: FindCategoriesFilters,
  ): Promise<PaginatedResponse<SubCategory>> {
    return await this.subCategoryRepository.findAll(filters);
  }
}
