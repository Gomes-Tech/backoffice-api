import {
  CreateProductFAQ,
  ProductFAQEntity,
  ProductFAQRepository,
  UpdateProductFAQ,
} from '@domain/product-faq';
import { BadRequestException, NotFoundException } from '@infra/filters';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaProductFAQRepository extends ProductFAQRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  findAll(): Promise<ProductFAQEntity[]> {
    return null;
  }

  async findById(id: string): Promise<ProductFAQEntity> {
    return await this.prismaService.productFAQ.findUnique({ where: { id } });
  }

  async create(dto: CreateProductFAQ, createdBy?: string): Promise<void> {
    try {
      await this.prismaService.productFAQ.create({
        data: {
          id: dto.id,
          answer: dto.answer,
          question: dto.question,
          Product: {
            connect: {
              id: dto.productId,
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException(
        'Erro ao criar a faq do produto: ' + error.message,
      );
    }
  }

  async update(
    id: string,
    dto: UpdateProductFAQ,
    userId: string,
  ): Promise<void> {
    try {
      await this.prismaService.productFAQ.update({
        where: { id },
        data: {
          question: dto.question,
          answer: dto.answer,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('FAQ do produto não encontrado');
      }
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      await this.prismaService.product.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('FAQ do Produto não encontrado.');
      }

      throw new BadRequestException(
        'Erro ao excluir o FAQ produto: ' + error.message,
      );
    }
  }
}
