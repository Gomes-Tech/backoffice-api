import { BannerRepository, CreateBanner } from '@domain/banner';
import { StorageService } from '@infra/providers';
import { CreateBannerDTO } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateBannerUseCase {
  constructor(
    @Inject('BannerRepository')
    private readonly bannerRepository: BannerRepository,
    private readonly storageService: StorageService,
  ) {}

  async execute(
    dto: CreateBannerDTO,
    files: { desktop: Express.Multer.File; mobile: Express.Multer.File },
    userId: string,
  ) {
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

    const data: CreateBanner = {
      id: uuidv4(),
      mobileImageKey: mobileImage.path,
      mobileImageUrl: mobileImage.publicUrl,
      desktopImageKey: desktopImage.path,
      desktopImageUrl: desktopImage.publicUrl,
      createdBy: userId,
      ...dto,
    };

    await this.bannerRepository.create(data);
  }
}
