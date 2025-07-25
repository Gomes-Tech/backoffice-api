import {
  CreateFooterMenu,
  FooterMenu,
  FooterMenuRepository,
  ListFooterMenu,
  UpdateFooterMenu,
} from '@domain/footer-menu';
import { BadRequestException, NotFoundException } from '@infra/filters';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

export class PrismaFooterMenuRepository extends FooterMenuRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async findAll(): Promise<ListFooterMenu[]> {
    const data = await this.prismaService.footerMenu.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
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

  async getAll(): Promise<FooterMenu[]> {
    return await this.prismaService.footerMenu.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        items: {
          select: {
            id: true,
            imageAlt: true,
            imageKey: true,
            imageUrl: true,
            imageHeight: true,
            imageWidth: true,
            type: true,
            url: true,
            content: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<FooterMenu> {
    return await this.prismaService.footerMenu.findUnique({
      where: {
        id,
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        items: {
          select: {
            id: true,
            imageAlt: true,
            imageKey: true,
            imageUrl: true,
            imageHeight: true,
            imageWidth: true,
            type: true,
            url: true,
            content: true,
          },
        },
      },
    });
  }

  async create(dto: CreateFooterMenu): Promise<void> {
    try {
      await this.prismaService.footerMenu.create({
        data: {
          ...dto,
          items: {
            createMany: {
              data: dto.items,
            },
          },
          createdBy: {
            connect: { id: dto.createdBy },
          },
        },
        include: { items: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(dto.createdBy + ' não encontrado.');
      }

      throw new BadRequestException(
        'Erro ao criar menu do rodapé: ' + error.message,
      );
    }
  }

  async update(id: string, dto: UpdateFooterMenu): Promise<void> {
    try {
      // 1. Buscar o menu existente com seus itens
      const existing = await this.prismaService.footerMenu.findUnique({
        where: { id, isDeleted: false },
        include: { items: true },
      });

      if (!existing) {
        throw new NotFoundException('Menu não encontrado');
      }

      const existingItemIds = existing.items.map((i) => i.id);
      const incomingItems = dto.items;

      // 2. Identificar itens a deletar (estavam no banco, mas não vieram no DTO)
      const incomingItemIds = incomingItems
        .filter((item) => !!item.id)
        .map((item) => item.id!);

      const itemsToDelete = existingItemIds.filter(
        (id) => !incomingItemIds.includes(id),
      );

      // 3. Separar os tipos de itens
      const itemsToUpdate = incomingItems.filter(
        (item) => item.id && existingItemIds.includes(item.id),
      );

      const itemsToCreate = incomingItems.filter(
        (item) => !item.id || !existingItemIds.includes(item.id),
      );

      // 4. Deletar os removidos
      if (itemsToDelete.length > 0) {
        await this.prismaService.footerMenuItem.deleteMany({
          where: {
            footerMenuId: id,
            id: { in: itemsToDelete },
          },
        });
      }

      // 5. Atualizar os itens existentes
      await Promise.all(
        itemsToUpdate.map((item) =>
          this.prismaService.footerMenuItem.update({
            where: { id: item.id },
            data: {
              type: item.type,
              url: item.url,
              imageUrl: item.imageUrl,
              imageAlt: item.imageAlt,
              imageKey: item.imageKey,
              content: item.content,
              imageWidth: item.imageWidth,
              imageHeight: item.imageHeight,
            },
          }),
        ),
      );

      // 6. Criar os novos itens
      if (itemsToCreate.length > 0) {
        await this.prismaService.footerMenuItem.createMany({
          data: itemsToCreate.map((item) => ({
            id: item.id, // opcional — se quiser permitir vir com id do frontend
            type: item.type,
            url: item.url,
            imageUrl: item.imageUrl,
            imageAlt: item.imageAlt,
            imageKey: item.imageKey,
            content: item.content,
            imageWidth: item.imageWidth,
            imageHeight: item.imageHeight,
            footerMenuId: id,
          })),
          skipDuplicates: true, // evita erro se id colidir
        });
      }

      // 7. Atualizar o menu em si
      await this.prismaService.footerMenu.update({
        where: { id },
        data: {
          name: dto.name,
          isActive: dto.isActive,
          updatedBy: {
            connect: {
              id: dto.updatedBy,
            },
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
        'Erro ao atualizar o menu do rodapé: ' + error.message,
      );
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      await this.prismaService.footerMenu.update({
        where: {
          id,
        },
        data: {
          isDeleted: true,
          deletedBy: {
            connect: {
              id: userId,
            },
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
        'Erro ao atualizar o menu do rodapé: ' + error.message,
      );
    }
  }
}
