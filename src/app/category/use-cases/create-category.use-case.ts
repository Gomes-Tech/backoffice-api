import { CategoryRepository } from '@domain/category';
import { CacheService } from '@infra/cache';
import { CreateCategoryDTO } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(dto: CreateCategoryDTO, userId: string): Promise<void> {
    await this.categoryRepository.create({
      id: uuidv4(),
      createdBy: userId,
      ...dto,
    });

    await this.cacheService.del('categories:tree');
    await this.cacheService.del('categories');
  }
}
