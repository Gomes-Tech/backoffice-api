import {
  CreateRelatedProduct,
  RelatedProductEntity,
  RelatedProductRepository,
} from '@domain/related-product';
import { BadRequestException, NotFoundException } from '@infra/filters';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaRelatedProductRepository extends RelatedProductRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  findAll(): Promise<RelatedProductEntity[]> {
    return null;
  }

  async findByProductId(productId: string): Promise<RelatedProductEntity[]> {
    try {
      const data = await this.prismaService.relatedProduct.findMany({
        where: { productId },
      });

      return data;
    } catch (error) {
      throw error;
    }
  }

  async findById(id: string): Promise<RelatedProductEntity> {
    return await this.prismaService.relatedProduct.findUnique({
      where: { id },
    });
  }

  async create(dto: CreateRelatedProduct): Promise<string> {
    try {
      await this.prismaService.relatedProduct.create({
        data: {
          ...dto,
        },
      });

      return dto.id;
    } catch (error) {
      throw new BadRequestException(
        'Erro ao criar o produto relacionado: ' + error.message,
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
      throw new NotFoundException('Produto relacionado não encontrado.');
    }
  }
}
