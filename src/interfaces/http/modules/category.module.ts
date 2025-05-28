import {
  CreateCategoryUseCase,
  FindAllCategoriesUseCase,
  FindCategoryBuIdUseCase,
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
    FindCategoryBuIdUseCase,
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    PrismaCategoryRepository,
    {
      provide: 'CategoryRepository',
      useExisting: PrismaCategoryRepository,
    },
  ],
  exports: [
    FindAllCategoriesUseCase,
    FindCategoryBuIdUseCase,
    PrismaCategoryRepository,
    {
      provide: 'CategoryRepository',
      useExisting: PrismaCategoryRepository,
    },
  ],
})
export class CategoryModule {}
