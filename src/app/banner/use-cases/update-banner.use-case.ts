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

    if (files.desktop && files.mobile) {
      const [desktopImage, mobileImage] = await Promise.all([
        this.storageService.uploadFile(
          'banners',
          files.desktop.filename,
          files.desktop.buffer,
        ),
        this.storageService.uploadFile(
          'banners/mobile',
          files.mobile.filename,
          files.mobile.buffer,
        ),
      ]);

      data.desktopImageUrl = desktopImage.publicUrl;
      data.desktopImageKey = desktopImage.path;
      data.mobileImageUrl = mobileImage.publicUrl;
      data.mobileImageKey = mobileImage.path;
    }

    await this.bannerRepository.update(id, data, '');
  }
}
