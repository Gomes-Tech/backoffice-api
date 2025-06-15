import { HeaderMenuRepository } from '@domain/header-menu';
import { CreateHeaderMenuDTO } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateHeaderMenuUseCase {
  constructor(
    @Inject('HeaderMenuRepository')
    private readonly headerMenuRepository: HeaderMenuRepository,
  ) {}

  async execute(dto: CreateHeaderMenuDTO, userId: string): Promise<void> {
    await this.headerMenuRepository.create({
      id: uuidv4(),
      createdBy: userId,
      ...dto,
    });
  }
}
