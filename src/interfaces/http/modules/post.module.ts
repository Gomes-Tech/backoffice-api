import {
  CreatePostUseCase,
  DeletePostUseCase,
  FindAllPostUseCase,
  FindPostByIdUseCase,
  UpdatePostUseCase,
} from '@app/post';
import { PrismaPostRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';
import { PostController } from '../controllers';

@Module({
  imports: [],
  controllers: [PostController],
  providers: [
    FindAllPostUseCase,
    FindPostByIdUseCase,
    CreatePostUseCase,
    UpdatePostUseCase,
    DeletePostUseCase,
    PrismaPostRepository,
    {
      provide: 'PostRepository',
      useExisting: PrismaPostRepository,
    },
  ],
  exports: [
    FindAllPostUseCase,
    FindPostByIdUseCase,
    CreatePostUseCase,
    UpdatePostUseCase,
    DeletePostUseCase,
    PrismaPostRepository,
    {
      provide: 'PostRepository',
      useExisting: PrismaPostRepository,
    },
  ],
})
export class PostModule {}


