import { Role, RoleRepository } from '@domain/role';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAllRoleUseCase {
  constructor(
    @Inject('RoleRepository')
    private readonly RoleRepository: RoleRepository,
  ) {}

  async execute(): Promise<Role[]> {
    return await this.RoleRepository.findAll();
  }
}
