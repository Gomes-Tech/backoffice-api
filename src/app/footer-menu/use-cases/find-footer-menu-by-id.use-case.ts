import { FooterMenu, FooterMenuRepository } from '@domain/footer-menu';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindFooterMenuByIdUseCase {
  constructor(
    @Inject('FooterMenuRepository')
    private readonly footerMenuRepository: FooterMenuRepository,
  ) {}

  async execute(id: string): Promise<FooterMenu> {
    const footerMenu = await this.footerMenuRepository.findById(id);

    if (!footerMenu) {
      throw new NotFoundException('Menu não encontrado');
    }

    return footerMenu;
  }
}
