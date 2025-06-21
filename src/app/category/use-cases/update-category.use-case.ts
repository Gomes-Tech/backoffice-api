import { CategoryRepository } from '@domain/category';
import { CacheService } from '@infra/cache';
import { UpdateCategoryDTO } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
    private readonly cacheService: CacheService,
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

    await this.cacheService.del('categories:tree');
    await this.cacheService.del('categories');
  }
}
