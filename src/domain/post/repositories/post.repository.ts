import { BaseRepository } from '@domain/common';
import { Post, CreatePost, UpdatePost } from '../entities/post.entity';

export abstract class PostRepository extends BaseRepository<
  Post,
  CreatePost,
  UpdatePost
> {
  abstract findAll(): Promise<Post[]>;
}

