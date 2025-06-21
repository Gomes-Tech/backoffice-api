import { BannerRepository, ListBanner } from '@domain/banner';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindListBannersUseCase {
  constructor(
    @Inject('BannerRepository')
    private readonly bannerRepository: BannerRepository,
  ) {}

  async execute(): Promise<ListBanner[]> {
    return await this.bannerRepository.findList();
  }
}
