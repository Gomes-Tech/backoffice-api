import { Banner, BannerRepository } from '@domain/banner';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindBannerByIdUseCase {
  constructor(
    @Inject('BannerRepository')
    private readonly bannerRepository: BannerRepository,
  ) {}

  async execute(id: string): Promise<Omit<Banner, 'createdAt' | 'createdBy'>> {
    const banner = await this.bannerRepository.findById(id);

    if (!banner) {
      throw new NotFoundException('Banner não encontrado');
    }

    return banner;
  }
}
