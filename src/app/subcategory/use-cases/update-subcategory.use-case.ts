import { SubCategoryRepository } from '@domain/subcategory';
import { UpdateSubCategoryDTO } from '@interfaces/http/dtos';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UpdateSubCategoryUseCase {
  constructor(
    @Inject('SubCategoryRepository')
    private readonly subCategoryRepository: SubCategoryRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateSubCategoryDTO,
    userId: string,
  ): Promise<void> {
    await this.subCategoryRepository.update(id, {
      ...dto,
      updatedBy: userId,
    });
  }
}
