import { Post, PostRepository, CreatePost, UpdatePost } from '@domain/post';
import { BadRequestException, NotFoundException } from '@infra/filters';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaPostRepository extends PostRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async findAll(): Promise<Post[]> {
    const data = await this.prismaService.post.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        imageKey: true,
        link: true,
        isActive: true,
        createdAt: true,
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });

    return data.map(
      (item) =>
        new Post(
          item.id,
          item.title,
          item.imageUrl,
          item.imageKey,
          item.link,
          item.isActive,
          item.createdAt,
          item.createdBy.name,
        ),
    );
  }

  async findById(id: string): Promise<Post | null> {
    const item = await this.prismaService.post.findFirst({
      where: { id, isDeleted: false },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        imageKey: true,
        link: true,
        isActive: true,
        createdAt: true,
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!item) return null;

    return new Post(
      item.id,
      item.title,
      item.imageUrl,
      item.imageKey,
      item.link,
      item.isActive,
      item.createdAt,
      item.createdBy.name,
    );
  }

  async create(dto: CreatePost): Promise<void> {
    try {
      await this.prismaService.post.create({
        data: {
          id: dto.id,
          title: dto.title,
          imageUrl: dto.imageUrl,
          imageKey: dto.imageKey,
          link: dto.link,
          isActive: dto.isActive,
          createdBy: {
            connect: {
              id: dto.createdBy,
            },
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

      throw new BadRequestException('Erro ao criar post: ' + error.message);
    }
  }

  async update(id: string, dto: UpdatePost, userId: string): Promise<void> {
    try {
      const existing = await this.prismaService.post.findFirst({
        where: { id, isDeleted: false },
      });

      if (!existing) {
        throw new NotFoundException('Post não encontrado');
      }

      const { title, imageUrl, imageKey, link, isActive, updatedBy } = dto;

      const data: Prisma.PostUpdateInput = {
        ...(title !== undefined && { title }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(imageKey !== undefined && { imageKey }),
        ...(link !== undefined && { link }),
        ...(isActive !== undefined && { isActive }),
        ...(updatedBy && {
          updatedBy: {
            connect: { id: updatedBy },
          },
        }),
      };

      await this.prismaService.post.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Post não encontrado.');
      }

      throw new BadRequestException('Erro ao atualizar post: ' + error.message);
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const existing = await this.prismaService.post.findFirst({
        where: { id, isDeleted: false },
      });

      if (!existing) {
        throw new NotFoundException('Post não encontrado');
      }

      await this.prismaService.post.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedBy: {
            connect: { id: userId },
          },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Post não encontrado.');
      }

      throw new BadRequestException('Erro ao excluir post: ' + error.message);
    }
  }
}

