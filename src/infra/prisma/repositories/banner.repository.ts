import {
  Banner,
  BannerRepository,
  CreateBanner,
  ListBanner,
  UpdateBanner,
} from '@domain/banner';
import { BadRequestException, NotFoundException } from '@infra/filters';
import { AdvancedLoggerService } from '@infra/logger';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaBannerRepository extends BannerRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: AdvancedLoggerService,
  ) {
    super();
    this.logger.setContext('PrismaBannerRepository');
  }

  async findAll(): Promise<ListBanner[]> {
    const startTime = Date.now();
    this.logger.log('Buscando todos os banners');

    try {
      const data = await this.prismaService.banner.findMany({
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

      const duration = Date.now() - startTime;
      this.logger.logPerformance('findAll', duration, {
        totalBanners: data.length,
      });

      return data.map((item) => ({
        ...item,
        createdBy: item.createdBy.name,
      }));
    } catch (error) {
      this.logger.logDatabaseError('findAll', error as Error);
      throw error;
    }
  }

  async findList(): Promise<ListBanner[]> {
    const startTime = Date.now();
    this.logger.log('Buscando lista de banners ativos');

    try {
      const data = await this.prismaService.banner.findMany({
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

      const duration = Date.now() - startTime;
      this.logger.logPerformance('findList', duration, {
        totalActiveBanners: data.length,
      });

      console.log(data);

      return data.map((item) => ({
        ...item,
        createdBy: item.createdBy.name,
      }));
    } catch (error) {
      this.logger.logDatabaseError('findList', error as Error);
      throw error;
    }
  }

  async findById(id: string): Promise<Banner> {
    const startTime = Date.now();
    this.logger.log(`Buscando banner por ID: ${id}`);

    try {
      const banner = await this.prismaService.banner.findUnique({
        where: {
          id,
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

      const duration = Date.now() - startTime;

      if (banner) {
        this.logger.logPerformance('findById', duration, {
          bannerId: id,
          bannerName: banner.name,
          found: true,
        });
      } else {
        this.logger.warn(`Banner não encontrado: ${id}`);
        this.logger.logPerformance('findById', duration, {
          bannerId: id,
          found: false,
        });
      }

      return banner;
    } catch (error) {
      this.logger.logDatabaseError('findById', error as Error, {
        bannerId: id,
      });
      throw error;
    }
  }

  async create(dto: CreateBanner): Promise<void> {
    const startTime = Date.now();
    this.logger.log('Criando novo banner');
    this.logger.debug(`Dados do banner: ${JSON.stringify(dto)}`);

    try {
      await this.prismaService.banner.create({
        data: { ...dto, createdBy: { connect: { id: dto.createdBy } } },
      });

      const duration = Date.now() - startTime;
      this.logger.logPerformance('create', duration, {
        bannerName: dto.name,
        createdBy: dto.createdBy,
      });

      this.logger.log(`Banner criado com sucesso: ${dto.name}`);
    } catch (error) {
      this.logger.logDatabaseError('create', error as Error, {
        bannerName: dto.name,
      });
      throw error;
    }
  }

  async update(id: string, dto: UpdateBanner): Promise<void> {
    const startTime = Date.now();
    this.logger.log(`Atualizando banner: ${id}`);
    this.logger.debug(`Dados de atualização: ${JSON.stringify(dto)}`);

    try {
      const {
        updatedBy,
        isActive,
        link,
        order,
        name,
        initialDate,
        finishDate,
        mobileImageKey,
        mobileImageUrl,
        desktopImageKey,
        desktopImageUrl,
      } = dto;

      const data: Record<string, any> = {
        ...(order !== undefined && { order }),
        ...(name !== undefined && { name }),
        ...(link !== undefined && { link }),
        ...(isActive !== undefined && { isActive }),
        ...(mobileImageUrl !== undefined && { mobileImageUrl }),
        ...(desktopImageUrl !== undefined && { desktopImageUrl }),
        ...(mobileImageKey !== undefined && { mobileImageKey }),
        ...(desktopImageKey !== undefined && { desktopImageKey }),
        initialDate,
        finishDate,
        updatedBy: { connect: { id: updatedBy } },
      };

      await this.prismaService.banner.update({
        where: { id },
        data,
      });

      const duration = Date.now() - startTime;
      this.logger.logPerformance('update', duration, {
        bannerId: id,
        bannerName: name,
        updatedBy,
      });

      this.logger.log(`Banner atualizado com sucesso: ${id}`);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        this.logger.warn(`Tentativa de atualizar banner inexistente: ${id}`);
        throw new NotFoundException('Banner não encontrado.');
      }

      this.logger.logDatabaseError('update', error as Error, {
        bannerId: id,
      });

      throw new BadRequestException('Erro ao atualizar o banner');
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    const startTime = Date.now();
    this.logger.log(`Deletando banner: ${id}`);
    this.logger.debug(`Usuário responsável pela exclusão: ${userId}`);

    try {
      await this.prismaService.banner.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedBy: {
            connect: { id: userId },
          },
        },
      });

      const duration = Date.now() - startTime;
      this.logger.logPerformance('delete', duration, {
        bannerId: id,
        deletedBy: userId,
      });

      this.logger.log(`Banner deletado com sucesso: ${id}`);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        this.logger.warn(`Tentativa de deletar banner inexistente: ${id}`);
        throw new NotFoundException('Banner não encontrado.');
      }

      this.logger.logDatabaseError('delete', error as Error, {
        bannerId: id,
        userId,
      });

      throw new BadRequestException(
        'Erro ao excluir o banner: ' + error.message,
      );
    }
  }
}
