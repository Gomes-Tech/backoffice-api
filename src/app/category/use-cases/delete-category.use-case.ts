import { CategoryRepository } from '@domain/category';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteCategoryUseCase {
  constructor(
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(categoryId: string, userId: string): Promise<void> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new Error(`Essa categoria não foi encontrada: ${categoryId}`);
    }

    await this.categoryRepository.delete(categoryId, userId);
  }
}
