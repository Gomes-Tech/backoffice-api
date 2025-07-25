import { BaseRepository } from '@domain/common';
import { ListUser, User } from '../entities';

export abstract class UserRepository extends BaseRepository<
  User,
  User,
  Partial<User>,
  ListUser,
  User,
  User,
  User
> {
  abstract findByEmail(email: string): Promise<User | null>;
  abstract resetPassword(id: string, password: string): Promise<void>;
}
