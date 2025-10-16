import { BannerRepository } from '@domain/banner';
import { Test, TestingModule } from '@nestjs/testing';
import { DeleteBannerUseCase } from './delete-banner.use-case';

describe('DeleteBannerUseCase', () => {
  let useCase: DeleteBannerUseCase;
  let bannerRepository: BannerRepository;

  const mockBannerRepository = {
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteBannerUseCase,
        {
          provide: 'BannerRepository',
          useValue: mockBannerRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteBannerUseCase>(DeleteBannerUseCase);
    bannerRepository = module.get<BannerRepository>('BannerRepository');

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should delete a banner', async () => {
      mockBannerRepository.delete.mockResolvedValue(undefined);

      await useCase.execute('banner-id', 'user-id');

      expect(mockBannerRepository.delete).toHaveBeenCalledWith(
        'banner-id',
        'user-id',
      );
      expect(mockBannerRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw error if repository fails', async () => {
      const errorMessage = 'Database error';
      const repositoryError = new Error(errorMessage);
      mockBannerRepository.delete.mockRejectedValue(repositoryError);

      await expect(useCase.execute('banner-id', 'user-id')).rejects.toThrow(
        errorMessage,
      );
    });

    it('should pass correct parameters to repository', async () => {
      const bannerId = 'test-banner-123';
      const userId = 'test-user-456';

      mockBannerRepository.delete.mockResolvedValue(undefined);

      await useCase.execute(bannerId, userId);

      expect(mockBannerRepository.delete).toHaveBeenCalledWith(
        bannerId,
        userId,
      );
    });
  });
});
