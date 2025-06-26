import {
  CreateHeaderMenu,
  HeaderMenu,
  HeaderMenuRepository,
  UpdateHeaderMenu,
} from '@domain/header-menu';
import { BadRequestException, NotFoundException } from '@infra/filters';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaHeaderMenuRepository extends HeaderMenuRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async findAll(): Promise<HeaderMenu[]> {
    const data = await this.prismaService.headerMenu.findMany({
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
  ): Promise<Omit<HeaderMenu, 'createdAt' | 'createdBy'> | null> {
    return await this.prismaService.headerMenu.findUnique({
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
      },
    });
  }

  async create(dto: CreateHeaderMenu): Promise<void> {
    try {
      await this.prismaService.headerMenu.create({
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

      throw new BadRequestException('Erro ao criar o menu: ' + error.message);
    }
  }

  async update(id: string, dto: UpdateHeaderMenu): Promise<void> {
    try {
      const { name, link, order, isActive, updatedBy } = dto;

      const data: Record<string, any> = {
        ...(name !== undefined && { name }),
        ...(link !== undefined && { link }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
        updatedBy: {
          connect: { id: updatedBy },
        },
      };

      await this.prismaService.headerMenu.update({
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
        'Erro ao atualizar o menu: ' + error.message,
      );
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      await this.prismaService.headerMenu.update({
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
        throw new NotFoundException('Menu não encontrado.');
      }

      throw new BadRequestException(
        'Erro ao atualizar o menu: ' + error.message,
      );
    }
  }
}
