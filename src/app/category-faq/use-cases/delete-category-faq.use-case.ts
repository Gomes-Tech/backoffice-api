import { CategoryFAQRepository } from '@domain/category-faq';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteCategoryFAQUseCase {
  constructor(
    @Inject('CategoryRepository')
    private readonly categoryFAQRepository: CategoryFAQRepository,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const categoryFAQ = await this.categoryFAQRepository.findById(id);
    if (!categoryFAQ) {
      throw new Error(`Esse FAQ da categoria não foi encontrado: ${id}`);
    }

    await this.categoryFAQRepository.delete(id, userId);
  }
}
