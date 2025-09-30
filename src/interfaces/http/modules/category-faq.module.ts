import {
  CreateCategoryFAQUseCase,
  DeleteCategoryFAQUseCase,
  UpdateCategoryFAQUseCase,
} from '@app/category-faq';
import {
  PrismaCategoryFAQRepository,
  PrismaCategoryRepository,
} from '@infra/prisma';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [
    CreateCategoryFAQUseCase,
    UpdateCategoryFAQUseCase,
    DeleteCategoryFAQUseCase,
    PrismaCategoryRepository,
    {
      provide: 'CategoryFAQRepository',
      useExisting: PrismaCategoryFAQRepository,
    },
  ],
  exports: [
    CreateCategoryFAQUseCase,
    UpdateCategoryFAQUseCase,
    DeleteCategoryFAQUseCase,
    PrismaCategoryRepository,
    {
      provide: 'CategoryFAQRepository',
      useExisting: PrismaCategoryFAQRepository,
    },
  ],
})
export class CategoryFAQModule {}
