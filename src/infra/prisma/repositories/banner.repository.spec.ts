import { CreateBanner, UpdateBanner } from '@domain/banner';
import { BadRequestException, NotFoundException } from '@infra/filters';
import { AdvancedLoggerService } from '@infra/logger';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { PrismaBannerRepository } from './banner.repository';

describe('PrismaBannerRepository', () => {
  let repository: PrismaBannerRepository;
  let prismaService: PrismaService;
  let logger: AdvancedLoggerService;

  const mockPrismaService = {
    banner: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockLogger = {
    setContext: jest.fn(),
    log: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    logPerformance: jest.fn(),
    logDatabaseError: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaBannerRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AdvancedLoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    repository = module.get<PrismaBannerRepository>(PrismaBannerRepository);
    prismaService = module.get<PrismaService>(PrismaService);
    logger = module.get<AdvancedLoggerService>(AdvancedLoggerService);
  });

  describe('constructor', () => {
    it('should set logger context', () => {
      expect(mockLogger.setContext).toHaveBeenCalledWith(
        'PrismaBannerRepository',
      );
    });
  });

  describe('findAll', () => {
    const mockBannerData = [
      {
        id: '1',
        name: 'Banner 1',
        link: 'https://example.com',
        order: 1,
        mobileImageUrl: 'mobile.jpg',
        mobileImageAlt: 'Mobile Alt',
        desktopImageUrl: 'desktop.jpg',
        desktopImageAlt: 'Desktop Alt',
        isActive: true,
        createdAt: new Date(),
        createdBy: { name: 'Admin User' },
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
        createdBy: { name: 'Admin User 2' },
      },
    ];

    it('should return all non-deleted banners ordered by order', async () => {
      mockPrismaService.banner.findMany.mockResolvedValue(mockBannerData);

      const result = await repository.findAll();

      expect(mockPrismaService.banner.findMany).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
        },
        orderBy: {
          order: 'asc',
        },
        select: {
          id: true,
          name: true,
          link: true,
          order: true,
          mobileImageUrl: true,
          mobileImageAlt: true,
          desktopImageUrl: true,
          desktopImageAlt: true,
          isActive: true,
          createdAt: true,
          createdBy: {
            select: {
              name: true,
            },
          },
        },
      });

      expect(result).toHaveLength(2);
      expect(result[0].createdBy).toBe('Admin User');
      expect(result[1].createdBy).toBe('Admin User 2');
      expect(mockLogger.log).toHaveBeenCalledWith('Buscando todos os banners');
      expect(mockLogger.logPerformance).toHaveBeenCalledWith(
        'findAll',
        expect.any(Number),
        { totalBanners: 2 },
      );
    });

    it('should return empty array when no banners exist', async () => {
      mockPrismaService.banner.findMany.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
      expect(mockLogger.logPerformance).toHaveBeenCalledWith(
        'findAll',
        expect.any(Number),
        { totalBanners: 0 },
      );
    });

    it('should log database error and rethrow when findMany fails', async () => {
      const error = new Error('Database connection failed');
      mockPrismaService.banner.findMany.mockRejectedValue(error);

      await expect(repository.findAll()).rejects.toThrow(error);

      expect(mockLogger.logDatabaseError).toHaveBeenCalledWith(
        'findAll',
        error,
      );
    });
  });

  describe('findList', () => {
    const mockActiveBannerData = [
      {
        id: '1',
        name: 'Active Banner',
        link: 'https://example.com',
        order: 1,
        mobileImageUrl: 'mobile.jpg',
        mobileImageAlt: 'Mobile Alt',
        desktopImageUrl: 'desktop.jpg',
        desktopImageAlt: 'Desktop Alt',
        initialDate: new Date(),
        finishDate: new Date(),
        isActive: true,
        createdAt: new Date(),
        createdBy: { name: 'Admin User' },
      },
    ];

    it('should return only active non-deleted banners', async () => {
      mockPrismaService.banner.findMany.mockResolvedValue(mockActiveBannerData);

      const result = await repository.findList();

      expect(mockPrismaService.banner.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          isDeleted: false,
        },
        orderBy: {
          order: 'asc',
        },
        select: {
          id: true,
          name: true,
          link: true,
          order: true,
          mobileImageUrl: true,
          mobileImageAlt: true,
          desktopImageUrl: true,
          desktopImageAlt: true,
          initialDate: true,
          finishDate: true,
          isActive: true,
          createdAt: true,
          createdBy: {
            select: {
              name: true,
            },
          },
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0].isActive).toBe(true);
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Buscando lista de banners ativos',
      );
      expect(mockLogger.logPerformance).toHaveBeenCalledWith(
        'findList',
        expect.any(Number),
        { totalActiveBanners: 1 },
      );
    });

    it('should log database error and rethrow when findMany fails', async () => {
      const error = new Error('Database error');
      mockPrismaService.banner.findMany.mockRejectedValue(error);

      await expect(repository.findList()).rejects.toThrow(error);

      expect(mockLogger.logDatabaseError).toHaveBeenCalledWith(
        'findList',
        error,
      );
    });
  });

  describe('findById', () => {
    const mockBanner = {
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
      finishDate: new Date(),
      initialDate: new Date(),
    };

    it('should return banner by id', async () => {
      mockPrismaService.banner.findUnique.mockResolvedValue(mockBanner);

      const result = await repository.findById('1');

      expect(mockPrismaService.banner.findUnique).toHaveBeenCalledWith({
        where: {
          id: '1',
          isDeleted: false,
        },
        select: {
          id: true,
          name: true,
          link: true,
          mobileImageUrl: true,
          mobileImageAlt: true,
          mobileImageKey: true,
          desktopImageUrl: true,
          desktopImageAlt: true,
          desktopImageKey: true,
          order: true,
          isActive: true,
          finishDate: true,
          initialDate: true,
        },
      });

      expect(result).toEqual(mockBanner);
      expect(mockLogger.log).toHaveBeenCalledWith('Buscando banner por ID: 1');
      expect(mockLogger.logPerformance).toHaveBeenCalledWith(
        'findById',
        expect.any(Number),
        {
          bannerId: '1',
          bannerName: 'Test Banner',
          found: true,
        },
      );
    });

    it('should return null when banner not found', async () => {
      mockPrismaService.banner.findUnique.mockResolvedValue(null);

      const result = await repository.findById('999');

      expect(result).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Banner não encontrado: 999',
      );
      expect(mockLogger.logPerformance).toHaveBeenCalledWith(
        'findById',
        expect.any(Number),
        {
          bannerId: '999',
          found: false,
        },
      );
    });

    it('should log database error and rethrow when findUnique fails', async () => {
      const error = new Error('Database error');
      mockPrismaService.banner.findUnique.mockRejectedValue(error);

      await expect(repository.findById('1')).rejects.toThrow(error);

      expect(mockLogger.logDatabaseError).toHaveBeenCalledWith(
        'findById',
        error,
        {
          bannerId: '1',
        },
      );
    });
  });

  describe('create', () => {
    const createBannerDto: CreateBanner = {
      id: '1',
      name: 'New Banner',
      link: 'https://example.com',
      mobileImageUrl: 'mobile.jpg',
      mobileImageAlt: 'Mobile Alt',
      mobileImageKey: 'mobile-key',
      desktopImageUrl: 'desktop.jpg',
      desktopImageAlt: 'Desktop Alt',
      desktopImageKey: 'desktop-key',
      order: 1,
      isActive: true,
      createdBy: 'user-id',
    };

    it('should create a new banner', async () => {
      mockPrismaService.banner.create.mockResolvedValue({});

      await repository.create(createBannerDto);

      expect(mockPrismaService.banner.create).toHaveBeenCalledWith({
        data: {
          ...createBannerDto,
          createdBy: { connect: { id: 'user-id' } },
        },
      });

      expect(mockLogger.log).toHaveBeenCalledWith('Criando novo banner');
      expect(mockLogger.debug).toHaveBeenCalledWith(
        `Dados do banner: ${JSON.stringify(createBannerDto)}`,
      );
      expect(mockLogger.logPerformance).toHaveBeenCalledWith(
        'create',
        expect.any(Number),
        {
          bannerName: 'New Banner',
          createdBy: 'user-id',
        },
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Banner criado com sucesso: New Banner',
      );
    });

    it('should log database error and rethrow when create fails', async () => {
      const error = new Error('Database error');
      mockPrismaService.banner.create.mockRejectedValue(error);

      await expect(repository.create(createBannerDto)).rejects.toThrow(error);

      expect(mockLogger.logDatabaseError).toHaveBeenCalledWith(
        'create',
        error,
        {
          bannerName: 'New Banner',
        },
      );
    });
  });

  describe('update', () => {
    const updateBannerDto: UpdateBanner = {
      name: 'Updated Banner',
      link: 'https://updated.com',
      order: 2,
      isActive: false,
      mobileImageUrl: 'new-mobile.jpg',
      desktopImageUrl: 'new-desktop.jpg',
      mobileImageKey: 'new-mobile-key',
      desktopImageKey: 'new-desktop-key',
      initialDate: new Date(),
      finishDate: new Date(),
      updatedBy: 'user-id',
    };

    it('should update an existing banner', async () => {
      mockPrismaService.banner.update.mockResolvedValue({});

      await repository.update('1', updateBannerDto);

      expect(mockPrismaService.banner.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          order: 2,
          name: 'Updated Banner',
          link: 'https://updated.com',
          isActive: false,
          mobileImageUrl: 'new-mobile.jpg',
          desktopImageUrl: 'new-desktop.jpg',
          mobileImageKey: 'new-mobile-key',
          desktopImageKey: 'new-desktop-key',
          initialDate: updateBannerDto.initialDate,
          finishDate: updateBannerDto.finishDate,
          updatedBy: { connect: { id: 'user-id' } },
        },
      });

      expect(mockLogger.log).toHaveBeenCalledWith('Atualizando banner: 1');
      expect(mockLogger.debug).toHaveBeenCalledWith(
        `Dados de atualização: ${JSON.stringify(updateBannerDto)}`,
      );
      expect(mockLogger.logPerformance).toHaveBeenCalledWith(
        'update',
        expect.any(Number),
        {
          bannerId: '1',
          bannerName: 'Updated Banner',
          updatedBy: 'user-id',
        },
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Banner atualizado com sucesso: 1',
      );
    });

    it('should throw NotFoundException when banner does not exist (P2025)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        {
          code: 'P2025',
          clientVersion: '5.0.0',
        },
      );
      mockPrismaService.banner.update.mockRejectedValue(prismaError);

      await expect(repository.update('999', updateBannerDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(repository.update('999', updateBannerDto)).rejects.toThrow(
        'Banner não encontrado.',
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Tentativa de atualizar banner inexistente: 999',
      );
    });

    it('should throw BadRequestException for other database errors', async () => {
      const error = new Error('Some database error');
      mockPrismaService.banner.update.mockRejectedValue(error);

      await expect(repository.update('1', updateBannerDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(repository.update('1', updateBannerDto)).rejects.toThrow(
        'Erro ao atualizar o banner: Some database error',
      );

      expect(mockLogger.logDatabaseError).toHaveBeenCalledWith(
        'update',
        error,
        {
          bannerId: '1',
        },
      );
    });

    it('should handle partial updates', async () => {
      const partialUpdate: UpdateBanner = {
        name: 'Partial Update',
        updatedBy: 'user-id',
      };

      mockPrismaService.banner.update.mockResolvedValue({});

      await repository.update('1', partialUpdate);

      expect(mockPrismaService.banner.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: 'Partial Update',
          initialDate: undefined,
          finishDate: undefined,
          updatedBy: { connect: { id: 'user-id' } },
        },
      });
    });
  });

  describe('delete', () => {
    it('should soft delete a banner', async () => {
      mockPrismaService.banner.update.mockResolvedValue({});

      await repository.delete('1', 'user-id');

      expect(mockPrismaService.banner.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          isDeleted: true,
          deletedBy: {
            connect: { id: 'user-id' },
          },
        },
      });

      expect(mockLogger.log).toHaveBeenCalledWith('Deletando banner: 1');
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Usuário responsável pela exclusão: user-id',
      );
      expect(mockLogger.logPerformance).toHaveBeenCalledWith(
        'delete',
        expect.any(Number),
        {
          bannerId: '1',
          deletedBy: 'user-id',
        },
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Banner deletado com sucesso: 1',
      );
    });

    it('should throw NotFoundException when banner does not exist (P2025)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        {
          code: 'P2025',
          clientVersion: '5.0.0',
        },
      );
      mockPrismaService.banner.update.mockRejectedValue(prismaError);

      await expect(repository.delete('999', 'user-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(repository.delete('999', 'user-id')).rejects.toThrow(
        'Banner não encontrado.',
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Tentativa de deletar banner inexistente: 999',
      );
    });

    it('should throw BadRequestException for other database errors', async () => {
      const error = new Error('Database error');
      mockPrismaService.banner.update.mockRejectedValue(error);

      await expect(repository.delete('1', 'user-id')).rejects.toThrow(
        BadRequestException,
      );
      await expect(repository.delete('1', 'user-id')).rejects.toThrow(
        'Erro ao excluir o banner: Database error',
      );

      expect(mockLogger.logDatabaseError).toHaveBeenCalledWith(
        'delete',
        error,
        {
          bannerId: '1',
          userId: 'user-id',
        },
      );
    });
  });
});
