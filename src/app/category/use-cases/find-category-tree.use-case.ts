import { CategoryRepository, CategoryTree } from '@domain/category';
import { CacheService } from '@infra/cache';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindCategoryTreeUseCase {
  constructor(
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(): Promise<CategoryTree[]> {
    const cachedCategoryTree =
      await this.cacheService.get<CategoryTree[]>('categories:tree');

    if (cachedCategoryTree) {
      return cachedCategoryTree;
    }

    const categoryTree = await this.categoryRepository.findCategoryTree();

    await this.cacheService.set('categories:tree', categoryTree);

    return categoryTree;
  }
}
