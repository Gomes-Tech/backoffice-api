import { Post, PostRepository } from '@domain/post';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAllPostUseCase {
  constructor(
    @Inject('PostRepository')
    private readonly postRepository: PostRepository,
  ) {}

  async execute(): Promise<Post[]> {
    return this.postRepository.findAll();
  }
}

