import { SubCategoryRepository } from '@domain/subcategory';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteSubCategoryUseCase {
  constructor(
    @Inject('SubCategoryRepository')
    private readonly subCategoryRepository: SubCategoryRepository,
  ) {}

  async execute(categoryId: string, userId: string): Promise<void> {
    const category = await this.subCategoryRepository.findById(categoryId);
    if (!category) {
      throw new Error(`Essa SubCategoria não foi encontrada: ${categoryId}`);
    }

    await this.subCategoryRepository.delete(categoryId, userId);
  }
}
