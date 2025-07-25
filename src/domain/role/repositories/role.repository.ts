import { BaseRepository } from '@domain/common';
import { CreateRole, Role, UpdateRole } from '../entities';

export abstract class RoleRepository extends BaseRepository<
  Role,
  CreateRole,
  UpdateRole,
  Role,
  Omit<Role, 'createdBy' | 'createdAt'>
> {}
