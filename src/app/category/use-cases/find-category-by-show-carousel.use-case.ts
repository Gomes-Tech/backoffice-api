import { CategoryDetails, CategoryRepository } from '@domain/category';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindCategoryByShowCarouselUseCase {
  constructor(
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(): Promise<
    Pick<CategoryDetails, 'id' | 'name' | 'slug' | 'categoryImageUrl'>[]
  > {
    return await this.categoryRepository.findByShowCarousel();
  }
}
