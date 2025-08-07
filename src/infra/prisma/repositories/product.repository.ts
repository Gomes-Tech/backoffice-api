import { ListProduct, Product } from '@domain/product/entities';
import { ProductRepository } from '@domain/product/repositories';
import { BadRequestException, NotFoundException } from '@infra/filters';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaProductRepository extends ProductRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async findAll(): Promise<ListProduct[]> {
    return [];
  }

  async findById(id: string): Promise<Product> {
    return null;
  }

  async create(dto: unknown, createdBy?: string): Promise<void> {}

  async update(id: string, dto: unknown, userId: string): Promise<void> {}

  async delete(id: string, userId: string): Promise<void> {
    try {
      await this.prismaService.product.update({
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
        throw new NotFoundException('Produto não encontrado.');
      }

      throw new BadRequestException(
        'Erro ao excluir o produto: ' + error.message,
      );
    }
  }
}
