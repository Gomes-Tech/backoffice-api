import { CategoryList, CategoryRepository } from '@domain/category';
import { CacheService } from '@infra/cache';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAllCategoriesUseCase {
  constructor(
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(): Promise<CategoryList[]> {
    const cachedCategories =
      await this.cacheService.get<CategoryList[]>('categories');

    if (cachedCategories) {
      return cachedCategories;
    }

    const categories = await this.categoryRepository.findAll();

    await this.cacheService.set('categories', categories);

    return categories;
  }
}
