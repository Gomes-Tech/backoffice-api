import { BlogRepository } from '@domain/blog';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class DeleteBlogUseCase {
  constructor(
    @Inject('BlogRepository')
    private readonly blogRepository: BlogRepository,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const existing = await this.blogRepository.findById(id);

    if (!existing) {
      throw new NotFoundException('Blog não encontrado');
    }

    await this.blogRepository.delete(id, userId);
  }
}
