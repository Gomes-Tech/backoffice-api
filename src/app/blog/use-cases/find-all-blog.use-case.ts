import { Blog, BlogRepository } from '@domain/blog';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAllBlogUseCase {
  constructor(
    @Inject('BlogRepository')
    private readonly blogRepository: BlogRepository,
  ) {}

  async execute(): Promise<Blog[]> {
    return this.blogRepository.findAll();
  }
}
