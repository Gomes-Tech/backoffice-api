import {
  CategoryFAQ,
  CategoryFAQRepository,
  CreateCategoryFAQ,
  UpdateCategoryFAQ,
} from '@domain/category-faq';
import { NotFoundException } from '@infra/filters';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaCategoryFAQRepository extends CategoryFAQRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async findAll(): Promise<CategoryFAQ[]> {
    return await this.prismaService.categoryFAQ.findMany({
      select: {
        id: true,
        question: true,
        answer: true,
      },
    });
  }

  async findById(id: string): Promise<CategoryFAQ> {
    return await this.prismaService.categoryFAQ.findUnique({
      where: { id },
      select: {
        id: true,
        question: true,
        answer: true,
      },
    });
  }

  async create(dto: CreateCategoryFAQ): Promise<void> {
    try {
      await this.prismaService.categoryFAQ.create({
        data: {
          ...dto,
        },
      });
    } catch (error) {
      throw new BadRequestException(
        'Erro ao criar o FAQ da categoria: ' + error.message,
      );
    }
  }

  async update(id: string, dto: UpdateCategoryFAQ): Promise<void> {
    try {
      await this.prismaService.categoryFAQ.update({
        where: { id },
        data: {
          ...dto,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('FAQ da categoria não encontrada.');
      }

      throw new BadRequestException(
        'Erro ao atualizar o FAQ da categoria: ' + error.message,
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prismaService.categoryFAQ.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('FAQ da categoria não encontrada.');
      }

      throw new BadRequestException(
        'Erro ao excluir o FAQ da categoria: ' + error.message,
      );
    }
  }
}
