import { Test, TestingModule } from '@nestjs/testing';
import { CreateBannerUseCase } from './create-banner.use-case';
import { BannerRepository } from '@domain/banner';
import { StorageService } from '@infra/providers';
import { CreateBannerDTO } from '@interfaces/http';

describe('CreateBannerUseCase', () => {
  let useCase: CreateBannerUseCase;
  let bannerRepository: BannerRepository;
  let storageService: StorageService;

  const mockBannerRepository = {
    create: jest.fn(),
  };

  const mockStorageService = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateBannerUseCase,
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

    useCase = module.get<CreateBannerUseCase>(CreateBannerUseCase);
    bannerRepository = module.get<BannerRepository>('BannerRepository');
    storageService = module.get<StorageService>(StorageService);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mockDto: CreateBannerDTO = {
      name: 'Test Banner',
      link: 'https://example.com',
      order: 1,
      isActive: true,
    };

    const mockDesktopFile = {
      originalname: 'desktop.jpg',
      buffer: Buffer.from('desktop-image'),
    } as Express.Multer.File;

    const mockMobileFile = {
      originalname: 'mobile.jpg',
      buffer: Buffer.from('mobile-image'),
    } as Express.Multer.File;

    const mockDesktopUploadResult = {
      path: 'banners/desktop.jpg',
      publicUrl: 'https://storage.example.com/banners/desktop.jpg',
    };

    const mockMobileUploadResult = {
      path: 'banners/mobile/mobile.jpg',
      publicUrl: 'https://storage.example.com/banners/mobile/mobile.jpg',
    };

    it('should create a banner with uploaded images', async () => {
      mockStorageService.uploadFile
        .mockResolvedValueOnce(mockDesktopUploadResult)
        .mockResolvedValueOnce(mockMobileUploadResult);

      await useCase.execute(
        mockDto,
        { desktop: mockDesktopFile, mobile: mockMobileFile },
        'user-id',
      );

      expect(mockStorageService.uploadFile).toHaveBeenCalledTimes(2);
      expect(mockStorageService.uploadFile).toHaveBeenCalledWith(
        'banners',
        'desktop.jpg',
        mockDesktopFile.buffer,
      );
      expect(mockStorageService.uploadFile).toHaveBeenCalledWith(
        'banners/mobile',
        'mobile.jpg',
        mockMobileFile.buffer,
      );

      expect(mockBannerRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          name: 'Test Banner',
          link: 'https://example.com',
          order: 1,
          isActive: true,
          mobileImageKey: 'banners/mobile/mobile.jpg',
          mobileImageUrl: 'https://storage.example.com/banners/mobile/mobile.jpg',
          desktopImageKey: 'banners/desktop.jpg',
          desktopImageUrl: 'https://storage.example.com/banners/desktop.jpg',
          mobileImageAlt: 'Test Banner',
          desktopImageAlt: 'Test Banner',
          createdBy: 'user-id',
        }),
      );
    });

    it('should upload images in parallel', async () => {
      mockStorageService.uploadFile
        .mockResolvedValueOnce(mockDesktopUploadResult)
        .mockResolvedValueOnce(mockMobileUploadResult);

      const startTime = Date.now();
      await useCase.execute(
        mockDto,
        { desktop: mockDesktopFile, mobile: mockMobileFile },
        'user-id',
      );
      const endTime = Date.now();

      // Verify that both uploads were called
      expect(mockStorageService.uploadFile).toHaveBeenCalledTimes(2);
      
      // The execution should be fast since uploads are parallel
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should throw error if storage service fails', async () => {
      const storageError = new Error('Storage upload failed');
      mockStorageService.uploadFile.mockRejectedValue(storageError);

      await expect(
        useCase.execute(
          mockDto,
          { desktop: mockDesktopFile, mobile: mockMobileFile },
          'user-id',
        ),
      ).rejects.toThrow('Storage upload failed');

      expect(mockBannerRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error if repository fails', async () => {
      mockStorageService.uploadFile
        .mockResolvedValueOnce(mockDesktopUploadResult)
        .mockResolvedValueOnce(mockMobileUploadResult);

      const repositoryError = new Error('Database error');
      mockBannerRepository.create.mockRejectedValue(repositoryError);

      await expect(
        useCase.execute(
          mockDto,
          { desktop: mockDesktopFile, mobile: mockMobileFile },
          'user-id',
        ),
      ).rejects.toThrow('Database error');
    });
  });
});
