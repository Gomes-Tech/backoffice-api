import { CategoryFAQRepository, CreateCategoryFAQ } from '@domain/category-faq';
import { Inject, Injectable } from '@nestjs/common';
import { generateId } from '@shared/utils';

@Injectable()
export class CreateCategoryFAQUseCase {
  constructor(
    @Inject('CategoryFAQRepository')
    private readonly categoryFAQRepository: CategoryFAQRepository,
  ) {}

  async execute(dto: CreateCategoryFAQ): Promise<void> {
    return await this.categoryFAQRepository.create({
      id: generateId(),
      ...dto,
    });
  }
}
