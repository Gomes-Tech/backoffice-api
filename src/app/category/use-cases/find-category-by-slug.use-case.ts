import { CategoryRepository } from '@domain/category';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindCategoryBySlugUseCase {
  constructor(
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(slug: string): Promise<any> {
    return await this.categoryRepository.findBySlug(slug);
  }
}
