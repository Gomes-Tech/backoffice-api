import { Test, TestingModule } from '@nestjs/testing';
import { FindListBannersUseCase } from './find-list-banner.use-case';
import { BannerRepository, ListBanner } from '@domain/banner';

describe('FindListBannersUseCase', () => {
  let useCase: FindListBannersUseCase;
  let bannerRepository: BannerRepository;

  const mockBannerRepository = {
    findList: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindListBannersUseCase,
        {
          provide: 'BannerRepository',
          useValue: mockBannerRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindListBannersUseCase>(FindListBannersUseCase);
    bannerRepository = module.get<BannerRepository>('BannerRepository');

    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mockActiveBanners: ListBanner[] = [
      {
        id: '1',
        name: 'Active Banner 1',
        link: 'https://example1.com',
        order: 1,
        mobileImageUrl: 'mobile1.jpg',
        mobileImageAlt: 'Mobile Alt 1',
        desktopImageUrl: 'desktop1.jpg',
        desktopImageAlt: 'Desktop Alt 1',
        isActive: true,
        createdAt: new Date(),
        createdBy: 'Admin User',
        initialDate: new Date(),
        finishDate: new Date(),
      },
      {
        id: '2',
        name: 'Active Banner 2',
        link: 'https://example2.com',
        order: 2,
        mobileImageUrl: 'mobile2.jpg',
        mobileImageAlt: 'Mobile Alt 2',
        desktopImageUrl: 'desktop2.jpg',
        desktopImageAlt: 'Desktop Alt 2',
        isActive: true,
        createdAt: new Date(),
        createdBy: 'Admin User 2',
        initialDate: new Date(),
        finishDate: new Date(),
      },
    ];

    it('should return only active banners', async () => {
      mockBannerRepository.findList.mockResolvedValue(mockActiveBanners);

      const result = await useCase.execute();

      expect(mockBannerRepository.findList).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockActiveBanners);
      expect(result).toHaveLength(2);
      expect(result.every((banner) => banner.isActive)).toBe(true);
    });

    it('should return empty array when no active banners exist', async () => {
      mockBannerRepository.findList.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(mockBannerRepository.findList).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should throw error if repository fails', async () => {
      const repositoryError = new Error('Database error');
      mockBannerRepository.findList.mockRejectedValue(repositoryError);

      await expect(useCase.execute()).rejects.toThrow('Database error');
    });

    it('should return banners with correct structure including dates', async () => {
      mockBannerRepository.findList.mockResolvedValue(mockActiveBanners);

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
        expect(banner).toHaveProperty('initialDate');
        expect(banner).toHaveProperty('finishDate');
      });
    });
  });
});
