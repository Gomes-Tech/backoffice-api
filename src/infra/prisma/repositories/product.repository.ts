import { ProductMapper } from '@domain/product';
import {
  CreateProduct,
  CreateProductImage,
  CreateProductVariant,
  FindAllProductFilters,
  ListProduct,
  ListProductsToView,
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

  async findToView(
    filters?: FindAllProductFilters,
  ): Promise<{ total: number; data: ListProductsToView[] }> {
    const take = filters?.take || 24;
    const skip = filters?.skip || 1;

    const buildProductConditions = () => {
      const conditions: any = { isDeleted: false };

      if (filters?.name) {
        conditions.name = {
          contains: filters.name,
          mode: 'insensitive',
        };
      }

      if (filters?.categories?.length) {
        // conditions.categories = {
        //   some: { id: { in: filters.categories } },
        // };

        conditions.AND = filters.categories.map((categoryId) => ({
          categories: { some: { id: categoryId } },
        }));
      }

      return conditions;
    };

    const buildVariantConditions = () => {
      const conditions: any = { isDeleted: false, isActive: true };

      if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
        conditions.price = {
          ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
          ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
        };
      }

      if (filters?.sku) {
        conditions.sku = { contains: filters.sku };
      }

      if (filters?.attributeValueIds?.length) {
        conditions.productVariantAttributes = {
          some: { attributeValueId: { in: filters.attributeValueIds } },
        };
      }

      return conditions;
    };

    const whereConditions = buildProductConditions();
    const variantConditions = buildVariantConditions();

    if (Object.keys(variantConditions).length > 1) {
      whereConditions.productVariants = { some: variantConditions };
    }

    let orderBy: any = { createdAt: 'desc' }; // padrão: mais recentes

    if (filters?.orderBy) {
      switch (filters.orderBy) {
        case 'bestSellers':
          orderBy = { salesCount: 'desc' };
          break;
      }
    }

    const [products, total] = await Promise.all([
      await this.prismaService.product.findMany({
        where: whereConditions,
        skip: (skip - 1) * take,
        take,
        orderBy,
        select: {
          id: true,
          name: true,
          slug: true,
          isExclusive: true,
          isPersonalized: true,
          immediateShipping: true,
          freeShipping: true,
          productVariants: {
            distinct: ['productId'],
            where: { isDeleted: false, isActive: true },
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              price: true,
              productImage: {
                where: {
                  desktopImageFirst: true,
                },
                select: {
                  desktopImageUrl: true,
                  desktopImageAlt: true,
                },
              },
              discountPix: true,
              discountPrice: true,
              sku: true,
              stock: true,
            },
          },
        },
      }),
      await this.prismaService.product.count({
        where: whereConditions,
      }),
    ]);

    if (filters?.orderBy === 'minPrice' || filters?.orderBy === 'maxPrice') {
      products.sort((a, b) => {
        const aPrice =
          filters.orderBy === 'minPrice'
            ? Math.min(...a.productVariants.map((v) => v.price))
            : Math.max(...a.productVariants.map((v) => v.price));

        const bPrice =
          filters.orderBy === 'minPrice'
            ? Math.min(...b.productVariants.map((v) => v.price))
            : Math.max(...b.productVariants.map((v) => v.price));

        return filters.orderBy === 'minPrice'
          ? aPrice - bPrice
          : bPrice - aPrice;
      });
    }

    return { data: ProductMapper.toListView(products as any), total };
  }

  async findAll(): Promise<ListProduct[]> {
    return [];
  }

  async findById(id: string): Promise<ProductAdmin> {
    const product = await this.prismaService.product.findUnique({
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
          select: { id: true },
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
        similarProducts: { select: { id: true } },
        relatedProducts: { select: { id: true } },
        productFAQ: true,
        productVariants: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'asc' },
          take: 1,
          select: {
            id: true,
            price: true,
            barCode: true,
            length: true,
            createdAt: true,
            productImage: {
              select: {
                id: true,
                desktopImageUrl: true,
                desktopImageKey: true,
                desktopImageFirst: true,
                mobileImageUrl: true,
                mobileImageKey: true,
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
              select: { attributeValueId: true },
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

    const allVariantAttributes =
      await this.prismaService.productVariant.findMany({
        where: { productId: id, isDeleted: false },
        select: {
          productVariantAttributes: {
            select: { attributeValueId: true },
            distinct: ['attributeValueId'],
          },
        },
      });

    const uniqueAttributeIds = [
      ...new Set(
        allVariantAttributes.flatMap((variant) =>
          (variant.productVariantAttributes ?? []).map(
            (attr) => attr.attributeValueId,
          ),
        ),
      ),
    ].map((id) => ({ attributeValueId: id }));

    console.log(uniqueAttributeIds);

    const data = {
      ...product,
      productVariants: [
        {
          ...product.productVariants[0],
          productVariantAttributes: uniqueAttributeIds,
        },
      ],
    };

    if (!data) {
      return null;
    }

    return ProductMapper.toAdmin(data);
  }

  async findByName(name: string): Promise<{ name: string }> {
    return await this.prismaService.product.findUnique({
      where: { name, isDeleted: false },
      select: { name: true },
    });
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

  async findProductAttributes(productIds: string[]) {
    const rows = await this.prismaService.productVariantAttributeValue.findMany(
      {
        where: {
          productVariant: {
            product: {
              id: { in: productIds },
            },
            isActive: true,
            isDeleted: false,
          },
        },
        distinct: ['attributeValueId'],
        select: {
          attributeValue: {
            select: {
              id: true,
              name: true,
              value: true,
              attribute: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    );

    const map = new Map<
      string,
      { id: string; name: string; value: string }[]
    >();

    rows.forEach((row) => {
      const attrName = row.attributeValue.attribute.name;
      const valueObj = {
        id: row.attributeValue.id,
        name: row.attributeValue.name,
        value: row.attributeValue.value,
      };

      if (!map.has(attrName)) {
        map.set(attrName, [valueObj]);
      } else {
        const existing = map.get(attrName)!;
        if (!existing.find((v) => v.value === valueObj.value)) {
          existing.push(valueObj);
        }
      }
    });

    return Array.from(map.entries()).map(([attributeName, values]) => ({
      attributeName,
      values,
    }));
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

  async deleteImageVariant(productImageId: string): Promise<void> {
    try {
      await this.prismaService.productImage.delete({
        where: { id: productImageId },
      });
    } catch (error) {
      throw new BadRequestException('Erro ao deletar image de variação');
    }
  }

  async update(id: string, dto: UpdateProduct, userId: string): Promise<void> {
    const {
      name,
      slug,
      description,
      technicalInfo,
      freeShipping,
      immediateShipping,
      inCutout,
      isExclusive,
      isGreenSeal,
      isPersonalized,
      seoTitle,
      seoDescription,
      seoCanonicalUrl,
      seoKeywords,
      seoMetaRobots,
      videoLink,
    } = dto;

    const data: Record<string, unknown> = {
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(description !== undefined && { description }),
      ...(technicalInfo !== undefined && { technicalInfo }),
      ...(freeShipping !== undefined && { freeShipping }),
      ...(immediateShipping !== undefined && { immediateShipping }),
      ...(inCutout !== undefined && { inCutout }),
      ...(isExclusive !== undefined && { isExclusive }),
      ...(isGreenSeal !== undefined && { isGreenSeal }),
      ...(isPersonalized !== undefined && { isPersonalized }),
      ...(seoTitle !== undefined && { seoTitle }),
      ...(seoDescription !== undefined && { seoDescription }),
      ...(seoCanonicalUrl !== undefined && { seoCanonicalUrl }),
      ...(seoKeywords !== undefined && { seoKeywords }),
      ...(seoMetaRobots !== undefined && { seoMetaRobots }),
      ...(videoLink !== undefined && { videoLink }),
    };

    try {
      await this.prismaService.product.update({
        where: { id, isDeleted: false },
        data: {
          ...data,
          categories: {
            set: dto.categories.map((categoryId) => ({ id: categoryId })),
          },
          similarProducts: {
            set: dto.similarProducts.map((productId) => ({ id: productId })),
          },
          relatedProducts: {
            set: dto.relatedProducts.map((productId) => ({ id: productId })),
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

  async updateVariant(
    variantId: string,
    dto: Omit<CreateProductVariant, 'id' | 'productId'>,
  ) {
    try {
      await this.prismaService.productVariant.update({
        where: { id: variantId, isDeleted: false },
        data: {
          ...dto,
          productVariantAttributes: {
            deleteMany: {
              productVariantId: variantId,
              attributeValueId: { notIn: dto.productVariantAttributes },
            },
            upsert: dto.productVariantAttributes.map((attributeValueId) => ({
              where: {
                productVariantId_attributeValueId: {
                  productVariantId: variantId,
                  attributeValueId,
                },
              },
              update: {
                attributeValueId,
              },
              create: {
                id: uuidv4(),
                productVariantId: variantId,
                attributeValueId,
              },
            })),
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Variação não encontrada.');
      }

      throw new BadRequestException(
        'Erro ao atualizar a variação do produto: ' + error.message,
      );
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

  async deleteVariant(variantId: string, userId: string): Promise<void> {
    try {
      await this.prismaService.productVariant.update({
        where: { id: variantId, isDeleted: false },
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
        throw new NotFoundException('Variação não encontrada.');
      }

      throw new BadRequestException(
        'Erro ao excluir a variação: ' + error.message,
      );
    }
  }
}
