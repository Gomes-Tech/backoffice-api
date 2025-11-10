import {
  CreateSimilarProduct,
  SimilarProductEntity,
  SimilarProductRepository,
} from '@domain/similar-product';
import { BadRequestException, NotFoundException } from '@infra/filters';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaSimilarProductRepository extends SimilarProductRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  findAll(): Promise<SimilarProductEntity[]> {
    return null;
  }

  async findByProductId(productId: string): Promise<SimilarProductEntity[]> {
    try {
      return await this.prismaService.similarProduct.findMany({
        where: { productId },
      });
    } catch (error) {
      throw error;
    }
  }

  async findById(id: string): Promise<SimilarProductEntity> {
    return await this.prismaService.relatedProduct.findUnique({
      where: { id },
    });
  }

  async create(dto: CreateSimilarProduct): Promise<string> {
    try {
      await this.prismaService.relatedProduct.create({
        data: {
          ...dto,
        },
      });

      return dto.id;
    } catch (error) {
      throw new BadRequestException(
        'Erro ao criar o produto similar: ' + error.message,
      );
    }
  }

  update(id: string, dto: unknown, userId: string): Promise<void> {
    return;
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      await this.prismaService.relatedProduct.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException('Produto similar não encontrado.');
    }
  }
}
