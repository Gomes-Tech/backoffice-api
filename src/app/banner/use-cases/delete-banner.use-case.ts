import { BannerRepository } from '@domain/banner';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteBannerUseCase {
  constructor(
    @Inject('BannerRepository')
    private readonly bannerRepository: BannerRepository,
  ) {}

  async execute(id: string, userId: string) {
    await this.bannerRepository.delete(id, userId);
  }
}
