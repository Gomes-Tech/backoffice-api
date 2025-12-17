import { Blog, BlogRepository, CreateBlog, UpdateBlog } from '@domain/blog';
import { BadRequestException, NotFoundException } from '@infra/filters';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaBlogRepository extends BlogRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async findAll(): Promise<Blog[]> {
    const data = await this.prismaService.blog.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        blogImageUrl: true,
        blogImageKey: true,
        link: true,
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
        new Blog(
          item.id,
          item.title,
          item.blogImageUrl,
          item.blogImageKey,
          item.link,
          item.createdAt,
          item.createdBy.name,
        ),
    );
  }

  async findById(id: string): Promise<Blog | null> {
    const item = await this.prismaService.blog.findFirst({
      where: { id, isDeleted: false },
      select: {
        id: true,
        title: true,
        blogImageUrl: true,
        blogImageKey: true,
        link: true,
        createdAt: true,
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!item) return null;

    return new Blog(
      item.id,
      item.title,
      item.blogImageUrl,
      item.blogImageKey,
      item.link,
      item.createdAt,
      item.createdBy.name,
    );
  }

  async create(dto: CreateBlog): Promise<void> {
    try {
      await this.prismaService.blog.create({
        data: {
          id: dto.id,
          title: dto.title,
          blogImageUrl: dto.blogImageUrl,
          blogImageKey: dto.blogImageKey,
          link: dto.link,
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

      throw new BadRequestException('Erro ao criar blog: ' + error.message);
    }
  }

  async update(id: string, dto: UpdateBlog): Promise<void> {
    try {
      const existing = await this.prismaService.blog.findFirst({
        where: { id, isDeleted: false },
      });

      if (!existing) {
        throw new NotFoundException('Blog não encontrado');
      }

      const { title, blogImageUrl, blogImageKey, link, updatedBy } = dto;

      const data: Prisma.BlogUpdateInput = {
        ...(title !== undefined && { title }),
        ...(blogImageUrl !== undefined && { blogImageUrl }),
        ...(blogImageKey !== undefined && { blogImageKey }),
        ...(link !== undefined && { link }),
        ...(updatedBy && {
          updatedBy: {
            connect: { id: updatedBy },
          },
        }),
      };

      await this.prismaService.blog.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Blog não encontrado.');
      }

      throw new BadRequestException('Erro ao atualizar blog: ' + error.message);
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const existing = await this.prismaService.blog.findFirst({
        where: { id, isDeleted: false },
      });

      if (!existing) {
        throw new NotFoundException('Blog não encontrado');
      }

      await this.prismaService.blog.update({
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
        throw new NotFoundException('Blog não encontrado.');
      }

      throw new BadRequestException('Erro ao excluir blog: ' + error.message);
    }
  }
}
