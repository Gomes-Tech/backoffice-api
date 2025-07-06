import { ListUser, User } from '../entities';

export abstract class UserRepository {
  abstract findAll(): Promise<ListUser[]>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract resetPassword(id: string, password: string): Promise<void>;
  abstract create(user: User): Promise<User>;
  abstract update(id: string, user: Partial<User>): Promise<User>;
  abstract delete(id: string): Promise<void>;
}
