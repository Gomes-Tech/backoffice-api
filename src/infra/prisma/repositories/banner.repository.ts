import {
  Banner,
  BannerRepository,
  CreateBanner,
  ListBanner,
  UpdateBanner,
} from '@domain/banner';
import { BadRequestException, NotFoundException } from '@infra/filters';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaBannerRepository extends BannerRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async findAll(): Promise<ListBanner[]> {
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

    return data.map((item) => ({
      ...item,
      createdBy: item.createdBy.name,
    }));
  }

  async findList(): Promise<ListBanner[]> {
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

    return data.map((item) => ({
      ...item,
      createdBy: item.createdBy.name,
    }));
  }

  async findById(id: string): Promise<Banner> {
    return await this.prismaService.banner.findUnique({
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
  }

  async create(dto: CreateBanner): Promise<void> {
    await this.prismaService.banner.create({
      data: { ...dto, createdBy: { connect: { id: dto.createdBy } } },
    });
  }

  async update(id: string, dto: UpdateBanner): Promise<void> {
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
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Banner não encontrado.');
      }

      throw new BadRequestException(
        'Erro ao atualizar o banner: ' + error.message,
      );
    }
  }

  async delete(id: string, userId: string): Promise<void> {
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
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Banner não encontrado.');
      }

      throw new BadRequestException(
        'Erro ao excluir o banner: ' + error.message,
      );
    }
  }
}
