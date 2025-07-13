import { RoleRepository } from '@domain/role';
import { UpdateRoleDTO } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UpdateRoleUseCase {
  constructor(
    @Inject('RoleRepository')
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(id: string, dto: UpdateRoleDTO, userId: string): Promise<void> {
    await this.roleRepository.update(id, {
      ...dto,
      updatedBy: userId,
    });
  }
}
