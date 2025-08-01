import {
  CreateSocialMedia,
  ListSocialMedia,
  SocialMedia,
  SocialMediaRepository,
  UpdateSocialMedia,
} from '@domain/social-media';
import { BadRequestException, NotFoundException } from '@infra/filters';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaSocialMediaRepository extends SocialMediaRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async findAll(): Promise<SocialMedia[]> {
    const data = await this.prismaService.socialMedia.findMany({
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
        isActive: true,
        headerImageUrl: true,
        headerImageKey: true,
        headerImageAlt: true,
        footerImageKey: true,
        footerImageUrl: true,
        footerImageAlt: true,
        showFooter: true,
        showHeader: true,
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

  async list(): Promise<ListSocialMedia[]> {
    const data = await this.prismaService.socialMedia.findMany({
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

  async findById(
    id: string,
  ): Promise<Omit<SocialMedia, 'createdBy' | 'createdAt'> | null> {
    return await this.prismaService.socialMedia.findUnique({
      where: {
        id,
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        link: true,
        order: true,
        isActive: true,
        headerImageUrl: true,
        headerImageKey: true,
        headerImageAlt: true,
        footerImageKey: true,
        footerImageUrl: true,
        footerImageAlt: true,
        showFooter: true,
        showHeader: true,
      },
    });
  }

  async create(dto: CreateSocialMedia): Promise<void> {
    try {
      await this.prismaService.socialMedia.create({
        data: {
          ...dto,
          createdBy: {
            connect: { id: dto.createdBy },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(dto.createdBy + ' não encontrado.');
      }

      throw new BadRequestException(
        'Erro ao criar social media: ' + error.message,
      );
    }
  }

  async update(id: string, dto: UpdateSocialMedia): Promise<void> {
    try {
      const { name, link, order, isActive, showFooter, showHeader, updatedBy } =
        dto;

      const data: Record<string, any> = {
        ...(name !== undefined && { name }),
        ...(link !== undefined && { link }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
        ...(showFooter !== undefined && { showFooter }),
        ...(showHeader !== undefined && { showHeader }),
        updatedBy: {
          connect: { id: updatedBy },
        },
      };

      await this.prismaService.socialMedia.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Menu não encontrado.');
      }

      throw new BadRequestException(
        'Erro ao atualizar o social media: ' + error.message,
      );
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      await this.prismaService.socialMedia.update({
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
        throw new NotFoundException('Social Media não encontrado.');
      }

      throw new BadRequestException(
        'Erro ao atualizar o social media: ' + error.message,
      );
    }
  }
}
