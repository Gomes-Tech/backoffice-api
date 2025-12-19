import { PostRepository } from '@domain/post';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class DeletePostUseCase {
  constructor(
    @Inject('PostRepository')
    private readonly postRepository: PostRepository,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const existing = await this.postRepository.findById(id);

    if (!existing) {
      throw new NotFoundException('Post não encontrado');
    }

    await this.postRepository.delete(id, userId);
  }
}

