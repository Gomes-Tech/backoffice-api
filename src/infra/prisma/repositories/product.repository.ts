import { ProductMapper } from '@domain/product';
import {
  CreateProduct,
  CreateProductFAQ,
  CreateProductImage,
  CreateProductVariant,
  ListProduct,
  Product,
  ProductAdmin,
  UpdateProduct,
} from '@domain/product/entities';
import { ProductRepository } from '@domain/product/repositories';
import { BadRequestException, NotFoundException } from '@infra/filters';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
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

  async findById(id: string): Promise<ProductAdmin> {
    const data = await this.prismaService.product.findUnique({
      where: { id, isDeleted: false },
      select: {
        id: true,
        name: true,
        slug: true,
        isExclusive: true,
        isGreenSeal: true,
        isPersonalized: true,
        immediateShipping: true,
        freeShipping: true,
        categories: {
          select: {
            id: true,
          },
        },
        videoLink: true,
        seoTitle: true,
        seoCanonicalUrl: true,
        seoDescription: true,
        seoKeywords: true,
        seoMetaRobots: true,
        technicalInfo: true,
        description: true,
        inCutout: true,
        productVariants: {
          orderBy: {
            createdAt: 'asc',
          },
          take: 1,
          select: {
            id: true,
            price: true,
            barCode: true,
            length: true,
            productImage: {
              select: {
                desktopImageUrl: true,
                desktopImageFirst: true,
                mobileImageUrl: true,
                mobileImageFirst: true,
              },
            },
            discountPix: true,
            discountPrice: true,
            weight: true,
            sku: true,
            stock: true,
            width: true,
            isActive: true,
            height: true,
            productVariantAttributes: {
              select: {
                attributeValueId: true,
              },
            },
            seoCanonicalUrl: true,
            seoDescription: true,
            seoKeywords: true,
            seoMetaRobots: true,
            seoTitle: true,
          },
        },
        similarProducts: {
          select: { id: true },
        },
        relatedProducts: {
          select: { id: true },
        },
      },
    });

    return ProductMapper.toAdmin(data);
  }

  async findBySlug(slug: string): Promise<Product> {
    const data = await this.prismaService.product.findUnique({
      where: { slug, isDeleted: false },
      select: {
        id: true,
        name: true,
        slug: true,
        isExclusive: true,
        isGreenSeal: true,
        isPersonalized: true,
        immediateShipping: true,
        freeShipping: true,
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        videoLink: true,
        seoTitle: true,
        seoCanonicalUrl: true,
        seoDescription: true,
        seoKeywords: true,
        seoMetaRobots: true,
        technicalInfo: true,
        description: true,
        inCutout: true,
        productFAQ: {
          select: {
            id: true,
            question: true,
            answer: true,
          },
        },
        productVariants: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            price: true,
            barCode: true,
            length: true,
            productImage: {
              select: {
                desktopImageUrl: true,
                desktopImageAlt: true,
                desktopImageFirst: true,
                mobileImageUrl: true,
                mobileImageAlt: true,
                mobileImageFirst: true,
              },
            },
            discountPix: true,
            discountPrice: true,
            weight: true,
            sku: true,
            stock: true,
            width: true,
            isActive: true,
            height: true,
            productVariantAttributes: {
              select: {
                id: true,
                attributeValue: {
                  select: {
                    id: true,
                    name: true,
                    value: true,
                    attribute: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
            seoCanonicalUrl: true,
            seoDescription: true,
            seoKeywords: true,
            seoMetaRobots: true,
            seoTitle: true,
          },
        },
      },
    });

    if (!data) {
      return null;
    }

    return ProductMapper.toView(data);
  }

  async create(dto: CreateProduct, createdBy?: string): Promise<CreateReturn> {
    try {
      const product = await this.prismaService.product.create({
        data: {
          id: dto.id,
          name: dto.name,
          slug: dto.slug,
          categories: {
            connect: dto.categories.map((categoryId: string) => ({
              id: categoryId,
            })),
          },
          videoLink: dto.videoLink,
          description: dto.description,
          technicalInfo: dto.technicalInfo,
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
        throw new NotFoundException(createdBy + ' não encontrado.');
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
                id: uuidv4(),
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

  async createProductFAQ(dto: CreateProductFAQ): Promise<void> {
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

  async update(id: string, dto: UpdateProduct, userId: string): Promise<void> {
    try {
      await this.prismaService.product.update({
        where: { id, isDeleted: false },
        data: {
          name: dto.name,
          slug: dto.slug,
          description: dto.description,
          technicalInfo: dto.technicalInfo,
          seoTitle: dto.seoTitle,
          seoDescription: dto.seoDescription,
          seoCanonicalUrl: dto.seoCanonicalUrl,
          seoKeywords: dto.seoKeywords,
          seoMetaRobots: dto.seoMetaRobots,
          videoLink: dto.videoLink,
          categories: {
            set: dto.categories.map((categoryId) => ({ id: categoryId })), // sobrescreve categorias
          },
          updatedBy: {
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
        'Erro ao atualizar o produto: ' + error.message,
      );
    }
  }

  async updateProductFAQ(dto: CreateProductFAQ): Promise<void> {
    try {
      await this.prismaService.productFAQ.update({
        where: { id: dto.id },
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
