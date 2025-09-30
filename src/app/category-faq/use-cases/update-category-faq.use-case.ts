import { CategoryFAQRepository, UpdateCategoryFAQ } from '@domain/category-faq';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UpdateCategoryFAQUseCase {
  constructor(
    @Inject('CategoryFAQRepository')
    private readonly categoryFAQRepository: CategoryFAQRepository,
  ) {}

  async execute(id: string, dto: UpdateCategoryFAQ): Promise<void> {
    await this.categoryFAQRepository.update(id, dto, '');
  }
}
