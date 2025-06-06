import { User } from '../entities';

export abstract class UserRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract create(user: User): Promise<User>;
  abstract update(id: string, user: Partial<User>): Promise<User>;
  abstract delete(id: string): Promise<void>;
}
