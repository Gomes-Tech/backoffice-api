import { PostRepository, CreatePost } from '@domain/post';
import { StorageService } from '@infra/providers';
import { CreatePostDTO } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CreatePostUseCase {
  constructor(
    @Inject('PostRepository')
    private readonly postRepository: PostRepository,
    private readonly storageService: StorageService,
  ) {}

  async execute(
    dto: CreatePostDTO,
    createdBy: string,
    image?: Express.Multer.File,
  ): Promise<void> {
    let imageUrl: string | null = null;
    let imageKey: string | null = null;

    if (image) {
      const uploaded = await this.storageService.uploadFile(
        'posts',
        image.originalname,
        image.buffer,
      );

      imageUrl = uploaded.publicUrl;
      imageKey = uploaded.path;
    }
    const post = new CreatePost(
      uuid(),
      dto.title,
      imageUrl,
      imageKey,
      dto.link,
      dto.isActive ?? true,
      createdBy,
    );

    await this.postRepository.create(post);
  }
}

