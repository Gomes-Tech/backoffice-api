import { HeaderMenu, HeaderMenuRepository } from '@domain/header-menu';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAllHeaderMenuUseCase {
  constructor(
    @Inject('HeaderMenuRepository')
    private readonly headerMenuRepository: HeaderMenuRepository,
  ) {}

  async execute(): Promise<HeaderMenu[]> {
    return await this.headerMenuRepository.findAll();
  }
}
