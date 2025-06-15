import { CreateHeaderMenu, HeaderMenu, UpdateHeaderMenu } from '../entities';

export abstract class HeaderMenuRepository {
  abstract findAll(): Promise<HeaderMenu[]>;
  abstract findById(id: string): Promise<HeaderMenu | null>;
  abstract create(dto: CreateHeaderMenu): Promise<void>;
  abstract update(id: string, dto: UpdateHeaderMenu): Promise<void>;
  abstract delete(id: string, userId: string): Promise<void>;
}
