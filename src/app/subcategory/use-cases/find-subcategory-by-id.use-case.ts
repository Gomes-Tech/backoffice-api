import { SubCategoryDetails, SubCategoryRepository } from '@domain/subcategory';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindSubCategoryBuIdUseCase {
  constructor(
    @Inject('SubCategoryRepository')
    private readonly subCategoryRepository: SubCategoryRepository,
  ) {}

  async execute(id: string): Promise<SubCategoryDetails> {
    const category = await this.subCategoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException('SubCategoria não encontrada');
    }

    return category;
  }
}
