import { ProductMapper } from '@domain/product';
import {
  CreateProduct,
  CreateProductImage,
  CreateProductVariant,
  FindAllProductFilters,
  ListProduct,
  ListProductAdmin,
  ListProductAdminVariant,
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
        conditions.OR = [
          {
            name: {
              contains: filters.name,
              mode: 'insensitive',
            },
          },
          {
            categories: {
              some: {
                name: {
                  contains: filters.name,
                  mode: 'insensitive',
                },
              },
            },
          },
        ];
      }

      if (filters?.categories?.length) {
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

  async findAllAdmin(): Promise<ListProductAdmin[]> {
    const products = await this.prismaService.product.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        slug: true,
        isExclusive: true,
        isPersonalized: true,
        freeShipping: true,
        immediateShipping: true,
        isGreenSeal: true,
        inCutout: true,
        salesCount: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            name: true,
          },
        },
        categories: {
          select: {
            name: true,
          },
        },
        productVariants: {
          where: {
            isDeleted: false,
          },
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            id: true,
            price: true,
            discountPrice: true,
            discountPix: true,
            stock: true,
            productImage: {
              where: {
                desktopImageFirst: true,
              },
              take: 1,
              select: {
                desktopImageUrl: true,
              },
            },
            productVariantAttributes: {
              where: {
                isDeleted: false,
              },
              select: {
                attributeValue: {
                  select: {
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
          },
        },
      },
    });

    return products.map((product) => {
      const variants = product.productVariants;

      // Buscar primeira imagem do produto (da primeira variante)
      const mainImage = variants.find((v) => v.productImage.length > 0)
        ?.productImage[0];

      // Primeiro, determinar qual tipo de atributo deve ser usado para TODAS as variantes
      // Verificar se ALGUMA variante tem tamanho
      const hasTamanho = variants.some((variant) =>
        variant.productVariantAttributes.some(
          (attr) =>
            attr.attributeValue.attribute.name.toLowerCase() === 'tamanho' &&
            attr.attributeValue.name,
        ),
      );

      // Se não tem tamanho, verificar se ALGUMA variante tem cor
      const hasCor =
        !hasTamanho &&
        variants.some((variant) =>
          variant.productVariantAttributes.some(
            (attr) =>
              attr.attributeValue.attribute.name.toLowerCase() === 'cor' &&
              attr.attributeValue.name,
          ),
        );

      // Se não tem tamanho nem cor, verificar se ALGUMA variante tem material
      const hasMaterial =
        !hasTamanho &&
        !hasCor &&
        variants.some((variant) =>
          variant.productVariantAttributes.some(
            (attr) =>
              attr.attributeValue.attribute.name.toLowerCase() === 'material' &&
              attr.attributeValue.name,
          ),
        );

      // Determinar qual tipo de atributo usar para todas as variantes
      const attributeTypeToUse = hasTamanho
        ? 'tamanho'
        : hasCor
          ? 'cor'
          : hasMaterial
            ? 'material'
            : null;

      // Set para rastrear atributos já usados
      const usedAttributes = new Set<string>();

      // Mapear variações com todos os detalhes e filtrar apenas as que têm atributos disponíveis
      const mappedVariants: ListProductAdminVariant[] = variants
        .map((variant) => {
          // Para cada variante, pegar apenas um atributo do tipo determinado
          const variantAttributes: string[] = [];

          if (attributeTypeToUse) {
            // Buscar atributo do tipo determinado que ainda não foi usado
            const attributeOfType = variant.productVariantAttributes.find(
              (attr) => {
                const attributeType =
                  attr.attributeValue.attribute.name.toLowerCase();
                const attributeValueName = attr.attributeValue.name;
                return (
                  attributeType === attributeTypeToUse &&
                  attributeValueName &&
                  !usedAttributes.has(attributeValueName)
                );
              },
            );

            // Só adiciona se encontrou um atributo que ainda não foi usado
            if (attributeOfType) {
              variantAttributes.push(attributeOfType.attributeValue.name);
              usedAttributes.add(attributeOfType.attributeValue.name);
            }
          } else {
            // Se não tem nenhum dos 3 tipos prioritários, buscar qualquer outro tipo
            const otherAttribute = variant.productVariantAttributes.find(
              (attr) => {
                const attributeValueName = attr.attributeValue.name;
                const attributeType =
                  attr.attributeValue.attribute.name.toLowerCase();

                return (
                  attributeValueName &&
                  attributeType !== 'tamanho' &&
                  attributeType !== 'cor' &&
                  attributeType !== 'material' &&
                  !usedAttributes.has(attributeValueName)
                );
              },
            );

            // Só adiciona se encontrou um atributo que ainda não foi usado
            if (otherAttribute) {
              variantAttributes.push(otherAttribute.attributeValue.name);
              usedAttributes.add(otherAttribute.attributeValue.name);
            }
          }

          // Retornar null se não encontrou atributo disponível (para filtrar depois)
          if (variantAttributes.length === 0) {
            return null;
          }

          return new ListProductAdminVariant(
            variant.id,
            variant.price,
            variant.discountPrice,
            variant.discountPix,
            variant.stock,
            variantAttributes, // Apenas um atributo por variante, sem repetição
            variant.productImage[0]?.desktopImageUrl || null,
          );
        })
        .filter(
          (variant): variant is ListProductAdminVariant => variant !== null,
        );

      // Criar tags baseadas nas flags e categorias
      const tags: string[] = [];
      if (product.freeShipping) tags.push('free');
      if (product.isGreenSeal) tags.push('greenseal');
      tags.push(...product.categories.map((cat) => cat.name.toLowerCase()));

      return new ListProductAdmin(
        product.id,
        product.name,
        product.slug,
        tags,
        mappedVariants,
        {
          isExclusive: product.isExclusive,
          isPersonalized: product.isPersonalized,
          freeShipping: product.freeShipping,
          immediateShipping: product.immediateShipping,
          isGreenSeal: product.isGreenSeal,
          inCutout: product.inCutout,
        },
        product.salesCount,
        product.createdAt,
        product.updatedAt,
        product.createdBy?.name || '',
        mainImage?.desktopImageUrl || null,
      );
    });
  }

  async findVariants(productId: string) {
    return await this.prismaService.productVariant.findMany({
      where: {
        productId,
        isDeleted: false,
        isActive: true,
      },
      select: {
        id: true,
        productVariantAttributes: {
          where: {
            isDeleted: false,
          },
          select: {
            attributeValueId: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<ProductAdmin> {
    try {
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
            where: { isDeleted: false, isActive: true },
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
          where: {
            productId: id,
            isDeleted: false,
            isActive: true,
          },
          select: {
            productVariantAttributes: {
              where: {
                isDeleted: false,
              },
              select: {
                attributeValueId: true,
              },
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

      const data = {
        ...product,
        productVariants: [
          {
            ...product.productVariants[0],
            productVariantAttributes: uniqueAttributeIds,
          },
        ],
      };

      return ProductMapper.toAdmin(data);
    } catch (error) {
      throw new NotFoundException('Produto não encontrado');
    }
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
            isDeleted: false,
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
              where: {
                isDeleted: false,
              },
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
          barCode: dto.barCode,
          discountPix: dto.discountPix,
          discountPrice: dto.discountPrice,
          height: dto.height,
          length: dto.length,
          price: dto.price,
          seoCanonicalUrl: dto.seoCanonicalUrl,
          seoDescription: dto.seoDescription,
          seoKeywords: dto.seoKeywords,
          seoMetaRobots: dto.seoMetaRobots,
          seoTitle: dto.seoTitle,
          sku: dto.sku,
          weight: dto.weight,
          width: dto.width,
          stock: dto.stock,
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
        where: {
          id: variantId,
        },
        data: {
          isDeleted: true,
          isActive: false,
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

  async deleteAttributeValue(
    id: string,
    attributeValueId: string,
  ): Promise<void> {
    await this.prismaService.productVariantAttributeValue.updateMany({
      where: {
        productVariant: {
          productId: id,
        },
        attributeValueId,
      },
      data: {
        isDeleted: true,
      },
    });
  }

  async findVariantsWithDetails(productId: string) {
    const variants = await this.prismaService.productVariant.findMany({
      where: {
        productId,
        isDeleted: false,
        isActive: true,
      },
      select: {
        id: true,
        price: true,
        sku: true,
        stock: true,
        weight: true,
        length: true,
        width: true,
        height: true,
        barCode: true,
        discountPix: true,
        discountPrice: true,
        isActive: true,
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        seoCanonicalUrl: true,
        seoMetaRobots: true,
        productVariantAttributes: {
          where: {
            isDeleted: false,
          },
          select: {
            attributeValueId: true,
          },
        },
      },
    });

    return variants;
  }

  async addAttributesToVariant(
    variantId: string,
    attributeValueIds: string[],
  ): Promise<void> {
    try {
      await this.prismaService.productVariantAttributeValue.createMany({
        data: attributeValueIds.map((attributeValueId) => ({
          id: uuidv4(),
          productVariantId: variantId,
          attributeValueId,
        })),
        skipDuplicates: true, // Evita erro se o atributo já existir
      });
    } catch (error) {
      throw new BadRequestException(
        'Erro ao adicionar atributos à variante: ' + error.message,
      );
    }
  }

  async deleteAttributeValuesVariant(
    productId: string,
    keepAttributes: string[],
    userId: string,
  ): Promise<void> {
    try {
      // 1️⃣ Busca todas as variações do produto com imagens e data de criação
      const variants = await this.prismaService.productVariant.findMany({
        where: { productId, isDeleted: false },
        include: {
          productVariantAttributes: {
            include: { attributeValue: true },
          },
          productImage: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      // 2️⃣ Filtra variações que contêm ALGUM atributo fora da lista de keepAttributes
      const variantsToDelete = variants.filter((variant) =>
        variant.productVariantAttributes.some(
          (attr) => !keepAttributes.includes(attr.attributeValueId),
        ),
      );

      // 3️⃣ Variantes que NÃO serão deletadas
      const variantsToKeep = variants.filter(
        (variant) => !variantsToDelete.includes(variant),
      );

      // 4️⃣ Para cada variante que será deletada, verifica se precisa transferir imagens
      for (const variantToDelete of variantsToDelete) {
        // Verifica se é a variante mais antiga entre TODAS as variantes (incluindo as que serão mantidas)
        const allVariantsSorted = [...variants].sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
        );
        const isOldestVariant = allVariantsSorted[0]?.id === variantToDelete.id;

        // Verifica se tem imagens
        const hasImages = variantToDelete.productImage.length > 0;

        if (isOldestVariant && hasImages) {
          // Verifica se as outras variantes (que não serão deletadas) têm imagens
          const otherVariantsHaveImages = variantsToKeep.some(
            (variant) => variant.productImage.length > 0,
          );

          // Se nenhuma outra variante tiver imagens, transfere para a mais antiga (excluindo a que será deletada)
          if (!otherVariantsHaveImages && variantsToKeep.length > 0) {
            // Encontra a variante mais antiga que não será deletada
            const oldestVariantToKeep = variantsToKeep.sort(
              (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
            )[0];

            // Transfere todas as imagens da variante que será deletada para a mais antiga que será mantida
            if (oldestVariantToKeep) {
              await this.prismaService.productImage.updateMany({
                where: {
                  productVariantId: variantToDelete.id,
                },
                data: {
                  productVariantId: oldestVariantToKeep.id,
                },
              });
            }
          }
        }
      }

      // 5️⃣ Marca como deletadas as variações encontradas
      if (variantsToDelete.length > 0) {
        await this.prismaService.productVariant.updateMany({
          where: {
            id: { in: variantsToDelete.map((v) => v.id) },
          },
          data: {
            isDeleted: true,
            isActive: false,
            deletedById: userId,
          },
        });

        // 5.2️⃣ Atualiza também os atributos dessas variantes
        const allAttributeIds = variantsToDelete.flatMap((v) =>
          v.productVariantAttributes.map((a) => a.id),
        );

        if (allAttributeIds.length > 0) {
          await this.prismaService.productVariantAttributeValue.updateMany({
            where: {
              id: { in: allAttributeIds },
            },
            data: {
              isDeleted: true,
            },
          });
        }
      }
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Não foi possível deletar as variações');
    }
  }
}
