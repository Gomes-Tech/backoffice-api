import { PostRepository, UpdatePost } from '@domain/post';
import { StorageService } from '@infra/providers';
import { UpdatePostDTO } from '@interfaces/http';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UpdatePostUseCase {
  constructor(
    @Inject('PostRepository')
    private readonly postRepository: PostRepository,
    private readonly storageService: StorageService,
  ) {}

  async execute(
    id: string,
    data: UpdatePostDTO,
    userId: string,
    image?: Express.Multer.File,
  ): Promise<void> {
    const existing = await this.postRepository.findById(id);

    if (!existing) {
      throw new NotFoundException('Post não encontrado');
    }

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
    } else {
      imageUrl = existing.imageUrl;
      imageKey = existing.imageKey;
    }

    const dto = new UpdatePost(
      data.title,
      imageUrl,
      imageKey,
      data.link,
      data.isActive,
      userId,
    );

    await this.postRepository.update(id, dto, userId);
  }
}
