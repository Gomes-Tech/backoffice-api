import { Test, TestingModule } from '@nestjs/testing';
import { BannerController } from './banner.controller';
import {
  CreateBannerUseCase,
  DeleteBannerUseCase,
  FindAllBannersUseCase,
  FindBannerByIdUseCase,
  FindListBannersUseCase,
  UpdateBannerUseCase,
} from '@app/banner';
import { CreateBannerDTO, UpdateBannerDTO } from '@interfaces/http/dtos';
import { BadRequestException } from '@infra/filters';
import { ListBanner, Banner } from '@domain/banner';

describe('BannerController', () => {
  let controller: BannerController;
  let findAllBannersUseCase: FindAllBannersUseCase;
  let findListBannersUseCase: FindListBannersUseCase;
  let findBannerByIdUseCase: FindBannerByIdUseCase;
  let createBannerUseCase: CreateBannerUseCase;
  let updateBannerUseCase: UpdateBannerUseCase;
  let deleteBannerUseCase: DeleteBannerUseCase;

  const mockFindAllBannersUseCase = {
    execute: jest.fn(),
  };

  const mockFindListBannersUseCase = {
    execute: jest.fn(),
  };

  const mockFindBannerByIdUseCase = {
    execute: jest.fn(),
  };

  const mockCreateBannerUseCase = {
    execute: jest.fn(),
  };

  const mockUpdateBannerUseCase = {
    execute: jest.fn(),
  };

  const mockDeleteBannerUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BannerController],
      providers: [
        {
          provide: FindAllBannersUseCase,
          useValue: mockFindAllBannersUseCase,
        },
        {
          provide: FindListBannersUseCase,
          useValue: mockFindListBannersUseCase,
        },
        {
          provide: FindBannerByIdUseCase,
          useValue: mockFindBannerByIdUseCase,
        },
        {
          provide: CreateBannerUseCase,
          useValue: mockCreateBannerUseCase,
        },
        {
          provide: UpdateBannerUseCase,
          useValue: mockUpdateBannerUseCase,
        },
        {
          provide: DeleteBannerUseCase,
          useValue: mockDeleteBannerUseCase,
        },
      ],
    }).compile();

    controller = module.get<BannerController>(BannerController);
    findAllBannersUseCase = module.get<FindAllBannersUseCase>(FindAllBannersUseCase);
    findListBannersUseCase = module.get<FindListBannersUseCase>(
      FindListBannersUseCase,
    );
    findBannerByIdUseCase = module.get<FindBannerByIdUseCase>(FindBannerByIdUseCase);
    createBannerUseCase = module.get<CreateBannerUseCase>(CreateBannerUseCase);
    updateBannerUseCase = module.get<UpdateBannerUseCase>(UpdateBannerUseCase);
    deleteBannerUseCase = module.get<DeleteBannerUseCase>(DeleteBannerUseCase);

    jest.clearAllMocks();
  });

  describe('getAll', () => {
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
    ];

    it('should return all banners', async () => {
      mockFindAllBannersUseCase.execute.mockResolvedValue(mockBanners);

      const result = await controller.getAll();

      expect(mockFindAllBannersUseCase.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockBanners);
    });

    it('should throw error if use case fails', async () => {
      const error = new Error('Use case error');
      mockFindAllBannersUseCase.execute.mockRejectedValue(error);

      await expect(controller.getAll()).rejects.toThrow('Use case error');
    });
  });

  describe('getList', () => {
    const mockActiveBanners: ListBanner[] = [
      {
        id: '1',
        name: 'Active Banner',
        link: 'https://example.com',
        order: 1,
        mobileImageUrl: 'mobile.jpg',
        mobileImageAlt: 'Mobile Alt',
        desktopImageUrl: 'desktop.jpg',
        desktopImageAlt: 'Desktop Alt',
        isActive: true,
        createdAt: new Date(),
        createdBy: 'Admin User',
        initialDate: new Date(),
        finishDate: new Date(),
      },
    ];

    it('should return list of active banners', async () => {
      mockFindListBannersUseCase.execute.mockResolvedValue(mockActiveBanners);

      const result = await controller.getList();

      expect(mockFindListBannersUseCase.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockActiveBanners);
    });

    it('should throw error if use case fails', async () => {
      const error = new Error('Use case error');
      mockFindListBannersUseCase.execute.mockRejectedValue(error);

      await expect(controller.getList()).rejects.toThrow('Use case error');
    });
  });

  describe('getById', () => {
    const mockBanner: Banner = {
      id: '1',
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

    it('should return banner by id', async () => {
      mockFindBannerByIdUseCase.execute.mockResolvedValue(mockBanner);

      const result = await controller.getById('1');

      expect(mockFindBannerByIdUseCase.execute).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockBanner);
    });

    it('should throw error if banner not found', async () => {
      const error = new Error('Banner not found');
      mockFindBannerByIdUseCase.execute.mockRejectedValue(error);

      await expect(controller.getById('999')).rejects.toThrow('Banner not found');
    });
  });

  describe('create', () => {
    const mockDto: CreateBannerDTO = {
      name: 'New Banner',
      link: 'https://example.com',
      order: 1,
      isActive: true,
    };

    const mockDesktopFile = {
      fieldname: 'desktop',
      originalname: 'desktop.jpg',
      buffer: Buffer.from('desktop-image'),
    } as Express.Multer.File;

    const mockMobileFile = {
      fieldname: 'mobile',
      originalname: 'mobile.jpg',
      buffer: Buffer.from('mobile-image'),
    } as Express.Multer.File;

    it('should create a banner with both images', async () => {
      mockCreateBannerUseCase.execute.mockResolvedValue(undefined);

      await controller.create(
        mockDto,
        [mockDesktopFile, mockMobileFile],
        'user-id',
      );

      expect(mockCreateBannerUseCase.execute).toHaveBeenCalledWith(
        mockDto,
        { desktop: mockDesktopFile, mobile: mockMobileFile },
        'user-id',
      );
    });

    it('should throw BadRequestException if desktop image is missing', async () => {
      await expect(
        controller.create(mockDto, [mockMobileFile], 'user-id'),
      ).rejects.toThrow(BadRequestException);

      await expect(
        controller.create(mockDto, [mockMobileFile], 'user-id'),
      ).rejects.toThrow('Imagens desktop e mobile são obrigatórias.');

      expect(mockCreateBannerUseCase.execute).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if mobile image is missing', async () => {
      await expect(
        controller.create(mockDto, [mockDesktopFile], 'user-id'),
      ).rejects.toThrow(BadRequestException);

      await expect(
        controller.create(mockDto, [mockDesktopFile], 'user-id'),
      ).rejects.toThrow('Imagens desktop e mobile são obrigatórias.');

      expect(mockCreateBannerUseCase.execute).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if no images provided', async () => {
      await expect(controller.create(mockDto, [], 'user-id')).rejects.toThrow(
        BadRequestException,
      );

      expect(mockCreateBannerUseCase.execute).not.toHaveBeenCalled();
    });

    it('should throw error if use case fails', async () => {
      const error = new Error('Use case error');
      mockCreateBannerUseCase.execute.mockRejectedValue(error);

      await expect(
        controller.create(mockDto, [mockDesktopFile, mockMobileFile], 'user-id'),
      ).rejects.toThrow('Use case error');
    });
  });

  describe('update', () => {
    const mockDto: UpdateBannerDTO = {
      name: 'Updated Banner',
      link: 'https://updated.com',
      order: 2,
      isActive: false,
    };

    const mockDesktopFile = {
      fieldname: 'desktop',
      originalname: 'new-desktop.jpg',
      buffer: Buffer.from('new-desktop-image'),
    } as Express.Multer.File;

    const mockMobileFile = {
      fieldname: 'mobile',
      originalname: 'new-mobile.jpg',
      buffer: Buffer.from('new-mobile-image'),
    } as Express.Multer.File;

    it('should update banner without new images', async () => {
      mockUpdateBannerUseCase.execute.mockResolvedValue(undefined);

      await controller.update('banner-id', mockDto, [], 'user-id');

      expect(mockUpdateBannerUseCase.execute).toHaveBeenCalledWith(
        'banner-id',
        mockDto,
        'user-id',
        { desktop: undefined, mobile: undefined },
      );
    });

    it('should update banner with new desktop image only', async () => {
      mockUpdateBannerUseCase.execute.mockResolvedValue(undefined);

      await controller.update('banner-id', mockDto, [mockDesktopFile], 'user-id');

      expect(mockUpdateBannerUseCase.execute).toHaveBeenCalledWith(
        'banner-id',
        mockDto,
        'user-id',
        { desktop: mockDesktopFile, mobile: undefined },
      );
    });

    it('should update banner with new mobile image only', async () => {
      mockUpdateBannerUseCase.execute.mockResolvedValue(undefined);

      await controller.update('banner-id', mockDto, [mockMobileFile], 'user-id');

      expect(mockUpdateBannerUseCase.execute).toHaveBeenCalledWith(
        'banner-id',
        mockDto,
        'user-id',
        { desktop: undefined, mobile: mockMobileFile },
      );
    });

    it('should update banner with both new images', async () => {
      mockUpdateBannerUseCase.execute.mockResolvedValue(undefined);

      await controller.update(
        'banner-id',
        mockDto,
        [mockDesktopFile, mockMobileFile],
        'user-id',
      );

      expect(mockUpdateBannerUseCase.execute).toHaveBeenCalledWith(
        'banner-id',
        mockDto,
        'user-id',
        { desktop: mockDesktopFile, mobile: mockMobileFile },
      );
    });

    it('should throw error if use case fails', async () => {
      const error = new Error('Use case error');
      mockUpdateBannerUseCase.execute.mockRejectedValue(error);

      await expect(
        controller.update('banner-id', mockDto, [], 'user-id'),
      ).rejects.toThrow('Use case error');
    });
  });

  describe('delete', () => {
    it('should delete a banner', async () => {
      mockDeleteBannerUseCase.execute.mockResolvedValue(undefined);

      await controller.delete('banner-id', 'user-id');

      expect(mockDeleteBannerUseCase.execute).toHaveBeenCalledWith(
        'banner-id',
        'user-id',
      );
      expect(mockDeleteBannerUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should throw error if use case fails', async () => {
      const error = new Error('Use case error');
      mockDeleteBannerUseCase.execute.mockRejectedValue(error);

      await expect(controller.delete('banner-id', 'user-id')).rejects.toThrow(
        'Use case error',
      );
    });

    it('should pass correct parameters to use case', async () => {
      mockDeleteBannerUseCase.execute.mockResolvedValue(undefined);

      const bannerId = 'test-banner-123';
      const userId = 'test-user-456';

      await controller.delete(bannerId, userId);

      expect(mockDeleteBannerUseCase.execute).toHaveBeenCalledWith(bannerId, userId);
    });
  });
});
