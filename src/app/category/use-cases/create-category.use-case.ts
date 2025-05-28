import { CategoryRepository } from '@domain/category';
import { CreateCategoryDTO } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(dto: CreateCategoryDTO, userId: string): Promise<void> {
    await this.categoryRepository.create({
      createdBy: userId,
      ...dto,
    });
  }
}
