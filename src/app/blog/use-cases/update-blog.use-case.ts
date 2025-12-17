import { BlogRepository, UpdateBlog } from '@domain/blog';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UpdateBlogUseCase {
  constructor(
    @Inject('BlogRepository')
    private readonly blogRepository: BlogRepository,
  ) {}

  async execute(
    id: string,
    data: {
      title?: string;
      link?: string;
      blogImageUrl?: string;
      blogImageKey?: string;
    },
    userId: string,
  ): Promise<void> {
    const existing = await this.blogRepository.findById(id);

    if (!existing) {
      throw new NotFoundException('Blog não encontrado');
    }

    const dto = new UpdateBlog(
      data.title,
      data.blogImageUrl,
      data.blogImageKey,
      data.link,
      userId,
    );

    await this.blogRepository.update(id, dto, userId);
  }
}
