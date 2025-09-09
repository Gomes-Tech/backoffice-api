import { BannerRepository, UpdateBanner } from '@domain/banner';
import { StorageService } from '@infra/providers';
import { UpdateBannerDTO } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UpdateBannerUseCase {
  constructor(
    @Inject('BannerRepository')
    private readonly bannerRepository: BannerRepository,
    private readonly storageService: StorageService,
  ) {}

  async execute(
    id: string,
    dto: UpdateBannerDTO,
    userId: string,
    files: { desktop?: Express.Multer.File; mobile?: Express.Multer.File },
  ) {
    let data: UpdateBanner = { ...dto, updatedBy: userId };

    if (files.desktop) {
      const desktopImage = await this.storageService.uploadFile(
        'banners',
        files.desktop.originalname,
        files.desktop.buffer,
      );

      data.desktopImageUrl = desktopImage.publicUrl;
      data.desktopImageKey = desktopImage.path;
    }

    if (files.mobile) {
      const mobileImage = await this.storageService.uploadFile(
        'banners/mobile',
        files.mobile.originalname,
        files.mobile.buffer,
      );

      data.mobileImageUrl = mobileImage.publicUrl;
      data.mobileImageKey = mobileImage.path;
    }

    await this.bannerRepository.update(id, data, '');
  }
}
