import { Injectable } from '@nestjs/common';
import { Blog, BlogRepository } from '@domain/blog';

@Injectable()
export class FindAllBlogUseCase {
  constructor(private readonly blogRepository: BlogRepository) {}

  async execute(): Promise<Blog[]> {
    return this.blogRepository.findAll();
  }
}


