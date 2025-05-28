import {
  Category,
  CategoryDetails,
  CategoryRepository,
  CreateCategory,
  FindCategoriesFilters,
  UpdateCategory,
} from '@domain/category';
import { BadRequestException, NotFoundException } from '@infra/filters';
import { PaginatedResponse } from '@interfaces/http';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaCategoryRepository extends CategoryRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async findAll(
    filters?: FindCategoriesFilters,
  ): Promise<PaginatedResponse<Category>> {
    const skip = filters?.skip || 0;
    const take = filters?.take || 10;

    const [categories, total] = await this.prismaService.$transaction([
      this.prismaService.category.findMany({
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

    const data = categories.map((category) => ({
      ...category,
      createdBy: category.createdBy.name,
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

  async findById(id: string): Promise<CategoryDetails | null> {
    return await this.prismaService.category.findUnique({
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

  async findBySlug(slug: string): Promise<CategoryDetails | null> {
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

  async create(category: CreateCategory): Promise<void> {
    try {
      await this.prismaService.category.create({
        data: {
          ...category,
          createdBy: {
            connect: { id: category.createdBy },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(category.createdBy + ' não encontrado.');
      }

      throw new BadRequestException(
        'Erro ao criar a categoria: ' + error.message,
      );
    }
  }

  async update(id: string, category: UpdateCategory): Promise<void> {
    try {
      await this.prismaService.category.update({
        where: { id },
        data: {
          ...category,
          updatedBy: {
            connect: { id: category.updatedBy },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Categoria não encontrada.');
      }

      throw new BadRequestException(
        'Erro ao atualizar a categoria: ' + error.message,
      );
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      await this.prismaService.category.update({
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
        throw new NotFoundException('Categoria não encontrada.');
      }

      throw new BadRequestException(
        'Erro ao excluir a categoria: ' + error.message,
      );
    }
  }
}
