import { Role, RoleRepository } from '@domain/role';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindRoleByIdUseCase {
  constructor(
    @Inject('RoleRepository')
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(id: string): Promise<Omit<Role, 'createdBy' | 'createdAt'>> {
    const Role = await this.roleRepository.findById(id);

    if (!Role) {
      throw new NotFoundException('Permissão não encontrada');
    }

    return Role;
  }
}
