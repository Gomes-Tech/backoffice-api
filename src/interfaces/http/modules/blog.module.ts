import {
  CreateBlogUseCase,
  DeleteBlogUseCase,
  FindAllBlogUseCase,
  FindBlogByIdUseCase,
  UpdateBlogUseCase,
} from '@app/blog';
import { PrismaBlogRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';
import { BlogController } from '../controllers';

@Module({
  imports: [],
  controllers: [BlogController],
  providers: [
    FindAllBlogUseCase,
    FindBlogByIdUseCase,
    CreateBlogUseCase,
    UpdateBlogUseCase,
    DeleteBlogUseCase,
    PrismaBlogRepository,
    {
      provide: 'BlogRepository',
      useExisting: PrismaBlogRepository,
    },
  ],
  exports: [
    FindAllBlogUseCase,
    FindBlogByIdUseCase,
    CreateBlogUseCase,
    UpdateBlogUseCase,
    DeleteBlogUseCase,
    PrismaBlogRepository,
    {
      provide: 'BlogRepository',
      useExisting: PrismaBlogRepository,
    },
  ],
})
export class BlogModule {}


