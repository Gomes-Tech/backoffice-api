import { RoleRepository } from '@domain/role';
import { CreateRoleDTO } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateRoleUseCase {
  constructor(
    @Inject('RoleRepository')
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(dto: CreateRoleDTO, userId: string): Promise<void> {
    await this.roleRepository.create({
      id: uuidv4(),
      createdBy: userId,
      ...dto,
      createdAt: new Date(),
    });
  }
}
