import {
  CreateCategoryUseCase,
  DeleteCategoryUseCase,
  FindAllCategoriesUseCase,
  FindCategoryByIdUseCase,
  FindCategoryBySlugUseCase,
  FindCategoryTreeUseCase,
  UpdateCategoryUseCase,
} from '@app/category';
import { PrismaCategoryRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';
import { CategoryController } from '../controllers';

@Module({
  imports: [],
  controllers: [CategoryController],
  providers: [
    FindAllCategoriesUseCase,
    FindCategoryTreeUseCase,
    FindCategoryBySlugUseCase,
    FindCategoryByIdUseCase,
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
    PrismaCategoryRepository,
    {
      provide: 'CategoryRepository',
      useExisting: PrismaCategoryRepository,
    },
  ],
  exports: [
    FindAllCategoriesUseCase,
    FindCategoryByIdUseCase,
    PrismaCategoryRepository,
    {
      provide: 'CategoryRepository',
      useExisting: PrismaCategoryRepository,
    },
  ],
})
export class CategoryModule {}
