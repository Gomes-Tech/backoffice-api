import { CategoryRepository } from '@domain/category';
import { UpdateCategoryDTO } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateCategoryDTO,
    userId: string,
  ): Promise<void> {
    await this.categoryRepository.update(id, {
      ...dto,
      updatedBy: userId,
    });
  }
}
