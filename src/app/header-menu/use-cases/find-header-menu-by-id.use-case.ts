import { HeaderMenu, HeaderMenuRepository } from '@domain/header-menu';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindHeaderMenuByIdUseCase {
  constructor(
    @Inject('HeaderMenuRepository')
    private readonly headerMenuRepository: HeaderMenuRepository,
  ) {}

  async execute(
    id: string,
  ): Promise<Omit<HeaderMenu, 'createdBy' | 'createdAt'>> {
    const headerMenu = await this.headerMenuRepository.findById(id);

    if (!headerMenu) {
      throw new NotFoundException('Menu não encontrado');
    }

    return headerMenu;
  }
}
