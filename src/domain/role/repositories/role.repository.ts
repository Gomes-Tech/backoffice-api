import { CreateRole, Role, UpdateRole } from '../entities';

export abstract class RoleRepository {
  abstract findAll(): Promise<Role[]>;
  abstract findById(
    id: string,
  ): Promise<Omit<Role, 'createdBy' | 'createdAt'> | null>;
  abstract create(dto: CreateRole): Promise<void>;
  abstract update(id: string, dto: UpdateRole): Promise<void>;
  abstract delete(id: string, userId: string): Promise<void>;
}
