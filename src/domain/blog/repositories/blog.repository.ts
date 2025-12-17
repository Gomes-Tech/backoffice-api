import { BaseRepository } from '@domain/common';
import { Blog, CreateBlog, UpdateBlog } from '../entities/blog.entity';

export abstract class BlogRepository extends BaseRepository<
  Blog,
  CreateBlog,
  UpdateBlog
> {
  abstract findAll(): Promise<Blog[]>;
}
