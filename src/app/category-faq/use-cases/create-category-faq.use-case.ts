import { CategoryFAQRepository, CreateCategoryFAQ } from '@domain/category-faq';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateCategoryFAQUseCase {
  constructor(
    @Inject('CategoryFAQRepository')
    private readonly categoryFAQRepository: CategoryFAQRepository,
  ) {}

  async execute(dto: CreateCategoryFAQ): Promise<void> {
    await this.categoryFAQRepository.create({
      id: uuidv4(),
      ...dto,
    });
  }
}
