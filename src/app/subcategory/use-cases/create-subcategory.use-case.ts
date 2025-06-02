import { CategoryRepository } from '@domain/category';
import { CreateSubCategoryDTO } from '@interfaces/http/dtos';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateSubCategoryUseCase {
  constructor(
    @Inject('SubCategoryRepository')
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(dto: CreateSubCategoryDTO, userId: string): Promise<void> {
    await this.categoryRepository.create({
      id: uuidv4(),
      createdBy: userId,
      ...dto,
    });
  }
}
