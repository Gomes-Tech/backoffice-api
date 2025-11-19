import { CategoryRepository } from '@domain/category';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindCategoryByNameUseCase {
  constructor(
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(name: string): Promise<{ name: string }> {
    const category = await this.categoryRepository.findByName(name);

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }
}
