import { CategoryRepository, CategoryTree } from '@domain/category';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindCategoryTreeUseCase {
  constructor(
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(): Promise<CategoryTree[]> {
    return await this.categoryRepository.findCategoryTree();
  }
}
