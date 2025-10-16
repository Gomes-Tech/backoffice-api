import { Test, TestingModule } from '@nestjs/testing';
import { FindBannerByIdUseCase } from './find-banner-by-id.use-case';
import { BannerRepository, Banner } from '@domain/banner';
import { NotFoundException } from '@infra/filters';

describe('FindBannerByIdUseCase', () => {
  let useCase: FindBannerByIdUseCase;
  let bannerRepository: BannerRepository;

  const mockBannerRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindBannerByIdUseCase,
        {
          provide: 'BannerRepository',
          useValue: mockBannerRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindBannerByIdUseCase>(FindBannerByIdUseCase);
    bannerRepository = module.get<BannerRepository>('BannerRepository');

    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mockBanner: Banner = {
      id: 'banner-id',
      name: 'Test Banner',
      link: 'https://example.com',
      mobileImageUrl: 'mobile.jpg',
      mobileImageAlt: 'Mobile Alt',
      mobileImageKey: 'mobile-key',
      desktopImageUrl: 'desktop.jpg',
      desktopImageAlt: 'Desktop Alt',
      desktopImageKey: 'desktop-key',
      order: 1,
      isActive: true,
      initialDate: new Date(),
      finishDate: new Date(),
    };

    it('should return banner when found', async () => {
      mockBannerRepository.findById.mockResolvedValue(mockBanner);

      const result = await useCase.execute('banner-id');

      expect(mockBannerRepository.findById).toHaveBeenCalledWith('banner-id');
      expect(result).toEqual(mockBanner);
    });

    it('should throw NotFoundException when banner not found', async () => {
      mockBannerRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(useCase.execute('non-existent-id')).rejects.toThrow(
        'Banner não encontrado',
      );

      expect(mockBannerRepository.findById).toHaveBeenCalledWith('non-existent-id');
    });

    it('should throw error if repository fails', async () => {
      const repositoryError = new Error('Database error');
      mockBannerRepository.findById.mockRejectedValue(repositoryError);

      await expect(useCase.execute('banner-id')).rejects.toThrow('Database error');
    });

    it('should call repository with correct id', async () => {
      mockBannerRepository.findById.mockResolvedValue(mockBanner);

      await useCase.execute('specific-banner-id');

      expect(mockBannerRepository.findById).toHaveBeenCalledWith('specific-banner-id');
      expect(mockBannerRepository.findById).toHaveBeenCalledTimes(1);
    });
  });
});
