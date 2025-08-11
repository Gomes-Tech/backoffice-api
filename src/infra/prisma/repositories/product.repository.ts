import {
  CreateProductImage,
  CreateProductVariant,
  ListProduct,
  Product,
} from '@domain/product/entities';
import { ProductRepository } from '@domain/product/repositories';
import { BadRequestException, NotFoundException } from '@infra/filters';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

type CreateReturn = {
  id: string;
};

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

  async create(dto: any, createdBy?: string): Promise<CreateReturn> {
    try {
      const product = await this.prismaService.product.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          categories: {
            connect: dto.categories.map((categoryId: string) => ({
              id: categoryId,
            })),
          },
          description: dto.description,
          seoTitle: dto.seoTitle,
          seoDescription: dto.seoDescription,
          seoCanonicalUrl: dto.seoCanonicalUrl,
          seoKeywords: dto.seoKeywords,
          seoMetaRobots: dto.seoMetaRobots,
          isGreenSeal: dto.isGreenSeal,
          freeShipping: dto.freeShipping,
          immediateShipping: dto.immediateShipping,
          isPersonalized: dto.isPersonalized,
          isExclusive: dto.isExclusive,
          inCutout: dto.inCutout,
          createdBy: {
            connect: {
              id: createdBy,
            },
          },
        },
      });

      return { id: product.id };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(dto?.createdBy + ' não encontrado.');
      }

      throw new BadRequestException(
        'Erro ao criar o produto: ' + error.message,
      );
    }
  }

  async createVariant(dto: CreateProductVariant): Promise<{ id: string }> {
    try {
      const variant = await this.prismaService.productVariant.create({
        data: {
          id: dto.id,
          barCode: dto.barCode,
          discountPix: dto.discountPix,
          price: dto.price,
          stock: dto.stock,
          sku: dto.sku,
          discountPrice: dto.discountPrice,
          height: dto.height,
          length: dto.length,
          weight: dto.weight,
          width: dto.width,
          isActive: dto.isActive,
          seoCanonicalUrl: dto.seoCanonicalUrl,
          seoTitle: dto.seoTitle,
          seoKeywords: dto.seoKeywords,
          seoDescription: dto.seoDescription,
          seoMetaRobots: dto.seoMetaRobots,
          productVariantAttributes: {
            createMany: {
              data: dto.productVariantAttributes.map((item) => ({
                attributeValueId: item,
              })),
            },
          },
          product: {
            connect: {
              id: dto.productId,
            },
          },
        },
      });

      return {
        id: variant.id,
      };
    } catch (error) {
      throw new BadRequestException(
        'Erro ao criar a variação: ' + error.message,
      );
    }
  }

  async createImageVariant(dto: CreateProductImage): Promise<void> {
    try {
      await this.prismaService.productImage.create({
        data: {
          id: dto.id,
          mobileImageAlt: dto.mobileImageAlt,
          mobileImageFirst: dto.mobileImageFirst,
          mobileImageKey: dto.mobileImageKey,
          mobileImageUrl: dto.mobileImageUrl,
          desktopImageUrl: dto.desktopImageUrl,
          desktopImageKey: dto.desktopImageKey,
          desktopImageFirst: dto.desktopImageFirst,
          desktopImageAlt: dto.desktopImageAlt,
          variant: {
            connect: {
              id: dto.productVariant,
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException('Erro ao criar a imagem: ' + error.message);
    }
  }

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
