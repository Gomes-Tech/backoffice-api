import { BannerRepository } from '@domain/banner';
import { UpdateBannerDTO } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UpdateBannerUseCase {
  constructor(
    @Inject('BannerRepository')
    private readonly bannerRepository: BannerRepository,
  ) {}

  async execute(id: string, dto: UpdateBannerDTO, userId: string) {
    await this.bannerRepository.update(
      id,
      {
        ...dto,
        updatedBy: userId,
      },
      '',
    );
  }
}
