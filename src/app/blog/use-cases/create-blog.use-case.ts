import { BlogRepository, CreateBlog } from '@domain/blog';
import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CreateBlogUseCase {
  constructor(private readonly blogRepository: BlogRepository) {}

  async execute(
    title: string,
    link: string,
    createdBy: string,
    blogImageUrl: string,
    blogImageKey: string,
  ): Promise<void> {
    const blog = new CreateBlog(
      uuid(),
      title,
      blogImageUrl,
      blogImageKey,
      link,
      createdBy,
    );

    await this.blogRepository.create(blog);
  }
}
