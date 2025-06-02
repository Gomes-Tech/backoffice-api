import {
  CreateSubCategoryUseCase,
  DeleteSubCategoryUseCase,
  FindAllSubCategoriesUseCase,
  FindSubCategoryBuIdUseCase,
  UpdateSubCategoryUseCase,
} from '@app/subcategory';
import { PrismaSubCategoryRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';
import { SubCategoryController } from '../controllers';

@Module({
  imports: [],
  controllers: [SubCategoryController],
  providers: [
    FindAllSubCategoriesUseCase,
    FindSubCategoryBuIdUseCase,
    CreateSubCategoryUseCase,
    UpdateSubCategoryUseCase,
    DeleteSubCategoryUseCase,
    PrismaSubCategoryRepository,
    {
      provide: 'SubCategoryRepository',
      useExisting: PrismaSubCategoryRepository,
    },
  ],
  exports: [
    FindAllSubCategoriesUseCase,
    FindSubCategoryBuIdUseCase,
    PrismaSubCategoryRepository,
    {
      provide: 'SubCategoryRepository',
      useExisting: PrismaSubCategoryRepository,
    },
  ],
})
export class SubCategoryModule {}
