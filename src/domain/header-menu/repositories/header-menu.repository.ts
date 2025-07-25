import { BaseRepository } from '@domain/common';
import { CreateHeaderMenu, HeaderMenu, UpdateHeaderMenu } from '../entities';

export abstract class HeaderMenuRepository extends BaseRepository<
  HeaderMenu,
  CreateHeaderMenu,
  UpdateHeaderMenu,
  HeaderMenu,
  Omit<HeaderMenu, 'createdAt' | 'createdBy'>
> {}
