import { Banner, ListBanner, CreateBanner, UpdateBanner } from '@domain/banner';

/**
 * Mock data factory for Banner entities
 */
export class BannerMockFactory {
  /**
   * Creates a mock Banner entity
   */
  static createBanner(overrides?: Partial<Banner>): Banner {
    return {
      id: 'mock-banner-id',
      name: 'Mock Banner',
      link: 'https://mock-banner.com',
      mobileImageUrl: 'https://storage.example.com/mobile.jpg',
      mobileImageAlt: 'Mock Mobile Alt',
      mobileImageKey: 'banners/mobile/mock-mobile.jpg',
      desktopImageUrl: 'https://storage.example.com/desktop.jpg',
      desktopImageAlt: 'Mock Desktop Alt',
      desktopImageKey: 'banners/mock-desktop.jpg',
      order: 1,
      isActive: true,
      initialDate: new Date('2024-01-01'),
      finishDate: new Date('2024-12-31'),
      ...overrides,
    };
  }

  /**
   * Creates a mock ListBanner entity
   */
  static createListBanner(overrides?: Partial<ListBanner>): ListBanner {
    return {
      id: 'mock-list-banner-id',
      name: 'Mock List Banner',
      link: 'https://mock-list-banner.com',
      order: 1,
      mobileImageUrl: 'https://storage.example.com/mobile.jpg',
      mobileImageAlt: 'Mock Mobile Alt',
      desktopImageUrl: 'https://storage.example.com/desktop.jpg',
      desktopImageAlt: 'Mock Desktop Alt',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      createdBy: 'Mock Admin User',
      initialDate: new Date('2024-01-01'),
      finishDate: new Date('2024-12-31'),
      ...overrides,
    };
  }

  /**
   * Creates multiple mock ListBanner entities
   */
  static createListBanners(count: number): ListBanner[] {
    return Array.from({ length: count }, (_, index) =>
      this.createListBanner({
        id: `mock-banner-${index + 1}`,
        name: `Mock Banner ${index + 1}`,
        order: index + 1,
      }),
    );
  }

  /**
   * Creates a mock CreateBanner DTO
   */
  static createCreateBannerDto(overrides?: Partial<CreateBanner>): CreateBanner {
    return {
      id: 'new-banner-id',
      name: 'New Mock Banner',
      link: 'https://new-mock-banner.com',
      mobileImageUrl: 'https://storage.example.com/new-mobile.jpg',
      mobileImageAlt: 'New Mock Mobile Alt',
      mobileImageKey: 'banners/mobile/new-mock-mobile.jpg',
      desktopImageUrl: 'https://storage.example.com/new-desktop.jpg',
      desktopImageAlt: 'New Mock Desktop Alt',
      desktopImageKey: 'banners/new-mock-desktop.jpg',
      order: 1,
      isActive: true,
      createdBy: 'mock-user-id',
      initialDate: new Date('2024-01-01'),
      finishDate: new Date('2024-12-31'),
      ...overrides,
    };
  }

  /**
   * Creates a mock UpdateBanner DTO
   */
  static createUpdateBannerDto(overrides?: Partial<UpdateBanner>): UpdateBanner {
    return {
      name: 'Updated Mock Banner',
      link: 'https://updated-mock-banner.com',
      order: 2,
      isActive: false,
      mobileImageUrl: 'https://storage.example.com/updated-mobile.jpg',
      mobileImageKey: 'banners/mobile/updated-mock-mobile.jpg',
      desktopImageUrl: 'https://storage.example.com/updated-desktop.jpg',
      desktopImageKey: 'banners/updated-mock-desktop.jpg',
      initialDate: new Date('2024-02-01'),
      finishDate: new Date('2024-11-30'),
      updatedBy: 'mock-user-id',
      ...overrides,
    };
  }

  /**
   * Creates a mock Multer file
   */
  static createMockFile(
    fieldname: string,
    filename: string,
    content: string = 'mock-file-content',
  ): Express.Multer.File {
    return {
      fieldname,
      originalname: filename,
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from(content),
      size: Buffer.from(content).length,
      stream: null as any,
      destination: '',
      filename: '',
      path: '',
    };
  }

  /**
   * Creates mock desktop and mobile files
   */
  static createMockFiles(): {
    desktop: Express.Multer.File;
    mobile: Express.Multer.File;
  } {
    return {
      desktop: this.createMockFile('desktop', 'desktop.jpg', 'desktop-image-content'),
      mobile: this.createMockFile('mobile', 'mobile.jpg', 'mobile-image-content'),
    };
  }

  /**
   * Creates a mock storage upload result
   */
  static createMockUploadResult(path: string, publicUrl: string) {
    return {
      path,
      publicUrl,
    };
  }
}
