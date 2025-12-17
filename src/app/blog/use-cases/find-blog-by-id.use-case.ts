import { Blog, BlogRepository } from '@domain/blog';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class FindBlogByIdUseCase {
  constructor(
    @Inject('BlogRepository')
    private readonly blogRepository: BlogRepository,
  ) {}

  async execute(id: string): Promise<Blog> {
    const blog = await this.blogRepository.findById(id);

    if (!blog) {
      throw new NotFoundException('Blog não encontrado');
    }

    return blog;
  }
}
