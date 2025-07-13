import { RoleRepository } from '@domain/role';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteRoleUseCase {
  constructor(
    @Inject('RoleRepository')
    private readonly RoleRepository: RoleRepository,
  ) {}

  async execute(roleId: string, userId: string): Promise<void> {
    await this.RoleRepository.findById(roleId);

    return await this.RoleRepository.delete(roleId, userId);
  }
}
