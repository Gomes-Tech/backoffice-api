import {
  CreateSubCategory,
  FindSubCategoriesFilters,
  SubCategory,
  SubCategoryDetails,
  SubCategoryRepository,
  UpdateSubCategory,
} from '@domain/subcategory';
import { BadRequestException, NotFoundException } from '@infra/filters';
import { PaginatedResponse } from '@interfaces/http';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaSubCategoryRepository extends SubCategoryRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async findAll(
    filters?: FindSubCategoriesFilters,
  ): Promise<PaginatedResponse<SubCategory>> {
    const skip = filters?.skip || 0;
    const take = Number(filters?.take) || 10;

    const [subcategories, total] = await this.prismaService.$transaction([
      this.prismaService.subcategory.findMany({
        where: {
          name: {
            contains: filters?.where?.name || '',
            mode: 'insensitive',
          },
          isDeleted: false,
        },
        orderBy: {
          [filters?.orderBy?.field || 'createdAt']:
            filters?.orderBy?.direction || 'desc',
        },
        skip,
        take,
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          createdAt: true,
          createdBy: {
            select: {
              name: true,
            },
          },
        },
      }),
      this.prismaService.category.count({
        where: {
          name: {
            contains: filters?.where?.name || '',
            mode: 'insensitive',
          },
          isDeleted: false,
        },
      }),
    ]);

    const data = subcategories.map((subcategory) => ({
      ...subcategory,
      createdBy: subcategory.createdBy.name,
    }));

    const totalPages = Math.ceil(total / take);

    return {
      data,
      total,
      totalPages,
      pageSize: take,
      currentPage: Math.floor(skip / take) + 1,
    };
  }

  async findById(id: string): Promise<SubCategoryDetails | null> {
    return await this.prismaService.subcategory.findUnique({
      where: { id, isDeleted: false },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        seoCanonicalUrl: true,
        seoDescription: true,
        seoKeywords: true,
        seoMetaRobots: true,
        seoTitle: true,
      },
    });
  }

  async findBySlug(slug: string): Promise<SubCategoryDetails | null> {
    return await this.prismaService.category.findUnique({
      where: { slug, isDeleted: false },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        seoCanonicalUrl: true,
        seoDescription: true,
        seoKeywords: true,
        seoMetaRobots: true,
        seoTitle: true,
      },
    });
  }

  async create(dto: CreateSubCategory): Promise<void> {
    try {
      await this.prismaService.subcategory.create({
        data: {
          ...dto,
          category: {
            connect: { id: dto.category },
          },
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
        'Erro ao criar a categoria: ' + error.message,
      );
    }
  }

  async update(id: string, dto: UpdateSubCategory): Promise<void> {
    try {
      await this.prismaService.subcategory.update({
        where: { id },
        data: {
          ...dto,
          updatedBy: {
            connect: { id: dto.updatedBy },
          },
          ...(dto.category && {
            category: {
              connect: { id: dto.category },
            },
          }),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('SubCategoria não encontrada.');
      }

      throw new BadRequestException(
        'Erro ao atualizar a SubCategoria: ' + error.message,
      );
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      await this.prismaService.subcategory.update({
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
        throw new NotFoundException('SubCategoria não encontrada.');
      }

      throw new BadRequestException(
        'Erro ao excluir a SubCategoria: ' + error.message,
      );
    }
  }
}
