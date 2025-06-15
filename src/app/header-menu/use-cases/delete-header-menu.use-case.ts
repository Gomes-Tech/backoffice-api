import { HeaderMenuRepository } from '@domain/header-menu';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteHeaderMenuUseCase {
  constructor(
    @Inject('HeaderMenuRepository')
    private readonly headerMenuRepository: HeaderMenuRepository,
  ) {}

  async execute(headerMenuId: string, userId: string): Promise<void> {
    const headerMenu = await this.headerMenuRepository.findById(headerMenuId);
    if (!headerMenu) {
      throw new Error(`Esse menu não foi encontrado: ${headerMenuId}`);
    }

    await this.headerMenuRepository.delete(headerMenuId, userId);
  }
}
