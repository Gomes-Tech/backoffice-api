import { Test, TestingModule } from '@nestjs/testing';
import { FindAllBannersUseCase } from './find-all-banner.use-case';
import { BannerRepository, ListBanner } from '@domain/banner';

describe('FindAllBannersUseCase', () => {
  let useCase: FindAllBannersUseCase;
  let bannerRepository: BannerRepository;

  const mockBannerRepository = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllBannersUseCase,
        {
          provide: 'BannerRepository',
          useValue: mockBannerRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindAllBannersUseCase>(FindAllBannersUseCase);
    bannerRepository = module.get<BannerRepository>('BannerRepository');

    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mockBanners: ListBanner[] = [
      {
        id: '1',
        name: 'Banner 1',
        link: 'https://example1.com',
        order: 1,
        mobileImageUrl: 'mobile1.jpg',
        mobileImageAlt: 'Mobile Alt 1',
        desktopImageUrl: 'desktop1.jpg',
        desktopImageAlt: 'Desktop Alt 1',
        isActive: true,
        createdAt: new Date(),
        createdBy: 'Admin User',
      },
      {
        id: '2',
        name: 'Banner 2',
        link: 'https://example2.com',
        order: 2,
        mobileImageUrl: 'mobile2.jpg',
        mobileImageAlt: 'Mobile Alt 2',
        desktopImageUrl: 'desktop2.jpg',
        desktopImageAlt: 'Desktop Alt 2',
        isActive: false,
        createdAt: new Date(),
        createdBy: 'Admin User 2',
      },
    ];

    it('should return all banners', async () => {
      mockBannerRepository.findAll.mockResolvedValue(mockBanners);

      const result = await useCase.execute();

      expect(mockBannerRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockBanners);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no banners exist', async () => {
      mockBannerRepository.findAll.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(mockBannerRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should throw error if repository fails', async () => {
      const repositoryError = new Error('Database error');
      mockBannerRepository.findAll.mockRejectedValue(repositoryError);

      await expect(useCase.execute()).rejects.toThrow('Database error');
    });

    it('should return banners with correct structure', async () => {
      mockBannerRepository.findAll.mockResolvedValue(mockBanners);

      const result = await useCase.execute();

      result.forEach((banner) => {
        expect(banner).toHaveProperty('id');
        expect(banner).toHaveProperty('name');
        expect(banner).toHaveProperty('link');
        expect(banner).toHaveProperty('order');
        expect(banner).toHaveProperty('mobileImageUrl');
        expect(banner).toHaveProperty('mobileImageAlt');
        expect(banner).toHaveProperty('desktopImageUrl');
        expect(banner).toHaveProperty('desktopImageAlt');
        expect(banner).toHaveProperty('isActive');
        expect(banner).toHaveProperty('createdAt');
        expect(banner).toHaveProperty('createdBy');
      });
    });
  });
});
