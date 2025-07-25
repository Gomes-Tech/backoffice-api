import { FooterMenuRepository } from '@domain/footer-menu';
import { CacheService } from '@infra/cache';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteFooterMenuUseCase {
  constructor(
    @Inject('FooterMenuRepository')
    private readonly footerMenuRepository: FooterMenuRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(categoryId: string, userId: string): Promise<void> {
    await this.footerMenuRepository.findById(categoryId);

    await this.footerMenuRepository.delete(categoryId, userId);

    await this.cacheService.del('footer-menu');
  }
}
