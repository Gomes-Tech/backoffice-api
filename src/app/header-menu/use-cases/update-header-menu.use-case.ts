import { HeaderMenuRepository } from '@domain/header-menu';
import { CacheService } from '@infra/cache';
import { UpdateHeaderMenuDTO } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UpdateHeaderMenuUseCase {
  constructor(
    @Inject('HeaderMenuRepository')
    private readonly headerMenuRepository: HeaderMenuRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(
    id: string,
    dto: UpdateHeaderMenuDTO,
    userId: string,
  ): Promise<void> {
    await this.headerMenuRepository.update(
      id,
      {
        ...dto,
        updatedBy: userId,
      },
      '',
    );

    await this.cacheService.del('header_menu');
  }
}
