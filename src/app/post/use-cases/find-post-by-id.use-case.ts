import { Post, PostRepository } from '@domain/post';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class FindPostByIdUseCase {
  constructor(
    @Inject('PostRepository')
    private readonly postRepository: PostRepository,
  ) {}

  async execute(id: string): Promise<Post> {
    const post = await this.postRepository.findById(id);

    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }

    return post;
  }
}

