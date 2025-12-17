import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogRepository } from '@domain/blog';

@Injectable()
export class DeleteBlogUseCase {
  constructor(private readonly blogRepository: BlogRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const existing = await this.blogRepository.findById(id);

    if (!existing) {
      throw new NotFoundException('Blog não encontrado');
    }

    await this.blogRepository.delete(id, userId);
  }
}


