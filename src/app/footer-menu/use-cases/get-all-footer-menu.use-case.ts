import { FooterMenu, FooterMenuRepository } from '@domain/footer-menu';
import { CacheService } from '@infra/cache';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GetAllFooterMenuUseCase {
  constructor(
    @Inject('FooterMenuRepository')
    private readonly footerMenuRepository: FooterMenuRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(): Promise<FooterMenu[]> {
    const cachedFooterMenu =
      await this.cacheService.get<FooterMenu[]>('footer-menu');

    if (cachedFooterMenu) {
      return cachedFooterMenu;
    }

    const footerMenu = await this.footerMenuRepository.getAll();

    await this.cacheService.set('footer-menu', footerMenu);

    return footerMenu;
  }
}
