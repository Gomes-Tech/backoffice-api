import { FooterMenuRepository, ListFooterMenu } from '@domain/footer-menu';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAllFooterMenuUseCase {
  constructor(
    @Inject('FooterMenuRepository')
    private readonly footerMenuRepository: FooterMenuRepository,
  ) {}

  async execute(): Promise<ListFooterMenu[]> {
    return await this.footerMenuRepository.findAll();
  }
}
