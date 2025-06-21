import { HeaderMenu, HeaderMenuRepository } from '@domain/header-menu';
import { CacheService } from '@infra/cache';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAllHeaderMenuUseCase {
  constructor(
    @Inject('HeaderMenuRepository')
    private readonly headerMenuRepository: HeaderMenuRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(): Promise<HeaderMenu[]> {
    const cachedHeaderMenus =
      await this.cacheService.get<HeaderMenu[]>('header_menu');

    if (cachedHeaderMenus) {
      return cachedHeaderMenus;
    }

    const headerMenus = await this.headerMenuRepository.findAll();

    await this.cacheService.set('header_menu', headerMenus);

    return headerMenus;
  }
}
