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

  async findByShowCarousel(): Promise<
    Pick<CategoryDetails, 'id' | 'name' | 'slug' | 'categoryImageUrl'>[]
  > {
    return await this.prismaService.category.findMany({
      where: { showCarousel: true, isDeleted: false },
      select: {
        id: true,
        name: true,
        slug: true,
        categoryImageUrl: true,
      },
    });
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
        showCarousel: true,
        seoCanonicalUrl: true,
        seoDescription: true,
        seoKeywords: true,
        seoMetaRobots: true,
        seoTitle: true,
        categoryImageKey: true,
        categoryImageUrl: true,
        categoryFAQ: {
          select: {
            id: true,
            question: true,
            answer: true,
          },
        },
      },
    });
  }

  async findBySlug(slug: string): Promise<any> {
    // Busca a categoria inicial
    const initialCategory = await this.prismaService.category.findFirst({
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

    if (!initialCategory) {
      throw new BadRequestException('Categoria não encontrada');
    }

    // Se não tem parent, retorna apenas a categoria
    if (!initialCategory.parentId) {
      return [
        {
          id: initialCategory.id,
          name: initialCategory.name,
          slug: initialCategory.slug,
        },
      ];
    }

    // Otimização: Busca todos os pais em uma única query
    // Primeiro, descobrimos todos os parentIds que precisamos
    const parentIdsToFetch = new Set<string>();
    let currentParentId: string | null = initialCategory.parentId;
    const maxDepth = 10; // Proteção contra loops infinitos

    // Coleta todos os parentIds (fazemos queries mínimas apenas para descobrir a hierarquia)
    const parentIdChain: string[] = [];
    for (let i = 0; i < maxDepth && currentParentId; i++) {
      parentIdChain.push(currentParentId);
      const parent = await this.prismaService.category.findFirst({
        where: { id: currentParentId, isDeleted: false },
        select: { parentId: true },
      });
      if (!parent || !parent.parentId) break;
      currentParentId = parent.parentId;
    }

    // Agora busca todos os pais de uma vez
    if (parentIdChain.length > 0) {
      const parents = await this.prismaService.category.findMany({
        where: {
          id: { in: parentIdChain },
          isDeleted: false,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          parentId: true,
        },
      });

      // Cria um mapa para lookup O(1)
      const parentMap = new Map(parents.map((p) => [p.id, p]));

      // Reconstrói o caminho completo
      const path: { id: string; name: string; slug: string }[] = [];

      // Adiciona a categoria inicial
      path.unshift({
        id: initialCategory.id,
        name: initialCategory.name,
        slug: initialCategory.slug,
      });

      // Reconstrói a hierarquia usando o mapa
      let currentId: string | null = initialCategory.parentId;
      while (currentId && parentMap.has(currentId)) {
        const parent = parentMap.get(currentId)!;
        path.unshift({
          id: parent.id,
          name: parent.name,
          slug: parent.slug,
        });
        currentId = parent.parentId;
      }

      return path;
    }

    // Fallback: retorna apenas a categoria inicial
    return [
      {
        id: initialCategory.id,
        name: initialCategory.name,
        slug: initialCategory.slug,
      },
    ];
  }

  async findByName(name: string): Promise<any> {
    try {
      return await this.prismaService.category.findUnique({
        where: { name, isDeleted: false },
        select: { name: true },
      });
    } catch (error) {
      throw error;
    }
  }

  async create(category: CreateCategory): Promise<void> {
    try {
      const {
        id,
        name,
        slug,
        isActive,
        showMenu,
        showCarousel,
        seoTitle,
        seoDescription,
        seoKeywords,
        seoCanonicalUrl,
        seoMetaRobots,
        createdBy,
        parentId,
        categoryImageUrl,
        categoryImageKey,
      } = category;

      await this.prismaService.category.create({
        data: {
          id,
          name,
          slug,
          isActive,
          showMenu,
          showCarousel,
          seoTitle,
          seoDescription,
          seoKeywords,
          seoCanonicalUrl,
          seoMetaRobots,
          categoryImageUrl,
          categoryImageKey,
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
        showCarousel,
        seoTitle,
        seoDescription,
        seoKeywords,
        seoCanonicalUrl,
        seoMetaRobots,
        updatedBy,
        parentId,
        categoryImageUrl,
        categoryImageKey,
      } = category;

      const data: Record<string, any> = {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(isActive !== undefined && { isActive }),
        ...(showMenu !== undefined && { showMenu }),
        ...(showCarousel !== undefined && { showCarousel }),
        ...(seoTitle !== undefined && { seoTitle }),
        ...(seoDescription !== undefined && { seoDescription }),
        ...(seoKeywords !== undefined && { seoKeywords }),
        ...(seoCanonicalUrl !== undefined && { seoCanonicalUrl }),
        ...(seoMetaRobots !== undefined && { seoMetaRobots }),
        ...(categoryImageUrl !== undefined && { categoryImageUrl }),
        ...(categoryImageKey !== undefined && { categoryImageKey }),
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
