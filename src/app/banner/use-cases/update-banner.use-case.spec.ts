import { Test, TestingModule } from '@nestjs/testing';
import { UpdateBannerUseCase } from './update-banner.use-case';
import { BannerRepository } from '@domain/banner';
import { StorageService } from '@infra/providers';
import { UpdateBannerDTO } from '@interfaces/http';

describe('UpdateBannerUseCase', () => {
  let useCase: UpdateBannerUseCase;
  let bannerRepository: BannerRepository;
  let storageService: StorageService;

  const mockBannerRepository = {
    update: jest.fn(),
  };

  const mockStorageService = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateBannerUseCase,
        {
          provide: 'BannerRepository',
          useValue: mockBannerRepository,
        },
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    useCase = module.get<UpdateBannerUseCase>(UpdateBannerUseCase);
    bannerRepository = module.get<BannerRepository>('BannerRepository');
    storageService = module.get<StorageService>(StorageService);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mockDto: UpdateBannerDTO = {
      name: 'Updated Banner',
      link: 'https://updated.com',
      order: 2,
      isActive: false,
    };

    const mockDesktopFile = {
      originalname: 'new-desktop.jpg',
      buffer: Buffer.from('new-desktop-image'),
    } as Express.Multer.File;

    const mockMobileFile = {
      originalname: 'new-mobile.jpg',
      buffer: Buffer.from('new-mobile-image'),
    } as Express.Multer.File;

    const mockDesktopUploadResult = {
      path: 'banners/new-desktop.jpg',
      publicUrl: 'https://storage.example.com/banners/new-desktop.jpg',
    };

    const mockMobileUploadResult = {
      path: 'banners/mobile/new-mobile.jpg',
      publicUrl: 'https://storage.example.com/banners/mobile/new-mobile.jpg',
    };

    it('should update banner without uploading new images', async () => {
      await useCase.execute('banner-id', mockDto, 'user-id', {});

      expect(mockStorageService.uploadFile).not.toHaveBeenCalled();
      expect(mockBannerRepository.update).toHaveBeenCalledWith(
        'banner-id',
        {
          ...mockDto,
          updatedBy: 'user-id',
        },
        '',
      );
    });

    it('should update banner with new desktop image only', async () => {
      mockStorageService.uploadFile.mockResolvedValue(mockDesktopUploadResult);

      await useCase.execute('banner-id', mockDto, 'user-id', {
        desktop: mockDesktopFile,
      });

      expect(mockStorageService.uploadFile).toHaveBeenCalledTimes(1);
      expect(mockStorageService.uploadFile).toHaveBeenCalledWith(
        'banners',
        'new-desktop.jpg',
        mockDesktopFile.buffer,
      );

      expect(mockBannerRepository.update).toHaveBeenCalledWith(
        'banner-id',
        {
          ...mockDto,
          updatedBy: 'user-id',
          desktopImageUrl: 'https://storage.example.com/banners/new-desktop.jpg',
          desktopImageKey: 'banners/new-desktop.jpg',
        },
        '',
      );
    });

    it('should update banner with new mobile image only', async () => {
      mockStorageService.uploadFile.mockResolvedValue(mockMobileUploadResult);

      await useCase.execute('banner-id', mockDto, 'user-id', {
        mobile: mockMobileFile,
      });

      expect(mockStorageService.uploadFile).toHaveBeenCalledTimes(1);
      expect(mockStorageService.uploadFile).toHaveBeenCalledWith(
        'banners/mobile',
        'new-mobile.jpg',
        mockMobileFile.buffer,
      );

      expect(mockBannerRepository.update).toHaveBeenCalledWith(
        'banner-id',
        {
          ...mockDto,
          updatedBy: 'user-id',
          mobileImageUrl: 'https://storage.example.com/banners/mobile/new-mobile.jpg',
          mobileImageKey: 'banners/mobile/new-mobile.jpg',
        },
        '',
      );
    });

    it('should update banner with both new images', async () => {
      mockStorageService.uploadFile
        .mockResolvedValueOnce(mockDesktopUploadResult)
        .mockResolvedValueOnce(mockMobileUploadResult);

      await useCase.execute('banner-id', mockDto, 'user-id', {
        desktop: mockDesktopFile,
        mobile: mockMobileFile,
      });

      expect(mockStorageService.uploadFile).toHaveBeenCalledTimes(2);
      expect(mockBannerRepository.update).toHaveBeenCalledWith(
        'banner-id',
        {
          ...mockDto,
          updatedBy: 'user-id',
          desktopImageUrl: 'https://storage.example.com/banners/new-desktop.jpg',
          desktopImageKey: 'banners/new-desktop.jpg',
          mobileImageUrl: 'https://storage.example.com/banners/mobile/new-mobile.jpg',
          mobileImageKey: 'banners/mobile/new-mobile.jpg',
        },
        '',
      );
    });

    it('should throw error if storage service fails', async () => {
      const storageError = new Error('Storage upload failed');
      mockStorageService.uploadFile.mockRejectedValue(storageError);

      await expect(
        useCase.execute('banner-id', mockDto, 'user-id', {
          desktop: mockDesktopFile,
        }),
      ).rejects.toThrow('Storage upload failed');

      expect(mockBannerRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error if repository fails', async () => {
      const repositoryError = new Error('Database error');
      mockBannerRepository.update.mockRejectedValue(repositoryError);

      await expect(
        useCase.execute('banner-id', mockDto, 'user-id', {}),
      ).rejects.toThrow('Database error');
    });
  });
});
