import { CategoryDetails, CategoryRepository } from '@domain/category';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindCategoryBuIdUseCase {
  constructor(
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(id: string): Promise<CategoryDetails> {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }
}
