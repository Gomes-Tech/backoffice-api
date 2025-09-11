import {
  CategoryDetails,
  CategoryList,
  CategoryRepository,
  CategoryTree,
  CreateCategory,
  UpdateCategory,
} from '@domain/category';
import { BadRequestException, NotFoundException } from '@infra/filters';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaCategoryRepository extends CategoryRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async findAll(): Promise<CategoryList[]> {
    const categories = await this.prismaService.category.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        parentId: true,
      },
    });

    // Mapeia os dados com children
    const mapped = categories.map((category) => ({
      ...category,
      children: [],
    }));

    // Construir árvore
    const map = new Map<string, any>();
    const tree: any[] = [];

    for (const category of mapped) {
      map.set(category.id, category);
    }

    for (const category of mapped) {
      const node = map.get(category.id);
      if (category.parentId && map.has(category.parentId)) {
        map.get(category.parentId).children.push(node);
      } else {
        tree.push(node);
      }
    }

    return tree;
  }

  async findCategoryTree(): Promise<CategoryTree[]> {
    const categories = await this.prismaService.category.findMany({
      where: {
        isDeleted: false,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        parentId: true,
        isActive: true,
        showMenu: true,
        slug: true,
      },
    });

    // Montar árvore
    const map = new Map<string, any>();
    const tree: any[] = [];

    for (const category of categories) {
      map.set(category.id, { ...category, children: [] });
    }

    for (const category of categories) {
      const node = map.get(category.id);
      if (category.parentId) {
        map.get(category.parentId)?.children.push(node);
      } else {
        tree.push(node);
      }
    }

    return tree;
  }

  async findById(id: string): Promise<CategoryDetails | null> {
    return await this.prismaService.category.findUnique({
      where: { id, isDeleted: false },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        showMenu: true,
        seoCanonicalUrl: true,
        seoDescription: true,
        seoKeywords: true,
        seoMetaRobots: true,
        seoTitle: true,
      },
    });
  }

  async findBySlug(slug: string): Promise<any> {
    let category = await this.prismaService.category.findFirst({
      where: {
        slug,
        isDeleted: false,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
      },
    });

    if (!category) {
      throw new BadRequestException('Categoria não encontrada');
    }

    // 2. Sobe a árvore coletando os pais
    const path: { id: string; name: string; slug: string }[] = [];

    while (category) {
      path.unshift({
        id: category.id,
        name: category.name,
        slug: category.slug,
      });

      if (!category.parentId) break;

      category = await this.prismaService.category.findFirst({
        where: { id: category.parentId },
        select: {
          id: true,
          name: true,
          slug: true,
          parentId: true,
        },
      });
    }

    return path;
  }

  async create(category: CreateCategory): Promise<void> {
    try {
      const {
        id,
        name,
        slug,
        isActive,
        showMenu,
        seoTitle,
        seoDescription,
        seoKeywords,
        seoCanonicalUrl,
        seoMetaRobots,
        createdBy,
        parentId,
      } = category;

      await this.prismaService.category.create({
        data: {
          id,
          name,
          slug,
          isActive,
          showMenu,
          seoTitle,
          seoDescription,
          seoKeywords,
          seoCanonicalUrl,
          seoMetaRobots,
          createdBy: {
            connect: { id: createdBy },
          },
          ...(parentId && {
            parent: {
              connect: { id: parentId },
            },
          }),
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
      const {
        name,
        slug,
        isActive,
        showMenu,
        seoTitle,
        seoDescription,
        seoKeywords,
        seoCanonicalUrl,
        seoMetaRobots,
        updatedBy,
        parentId,
      } = category;

      const data: Record<string, any> = {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(isActive !== undefined && { isActive }),
        ...(showMenu !== undefined && { showMenu }),
        ...(seoTitle !== undefined && { seoTitle }),
        ...(seoDescription !== undefined && { seoDescription }),
        ...(seoKeywords !== undefined && { seoKeywords }),
        ...(seoCanonicalUrl !== undefined && { seoCanonicalUrl }),
        ...(seoMetaRobots !== undefined && { seoMetaRobots }),
        updatedBy: { connect: { id: updatedBy } },
      };

      if (parentId !== undefined) {
        if (parentId) {
          data.parent = { connect: { id: parentId } };
        } else {
          data.parent = { disconnect: true };
        }
      }

      await this.prismaService.category.update({
        where: { id },
        data,
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
