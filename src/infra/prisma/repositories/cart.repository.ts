import {
  CartRepository,
  CreateCartItem,
  ReturnCart,
  ReturnCartItem,
} from '@domain/cart';
import { CouponType } from '@domain/coupon';
import { BadRequestException } from '@infra/filters';
import { Injectable } from '@nestjs/common';
import { CartStatus } from '@prisma/client';
import { generateId } from '@shared/utils';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaCartRepository extends CartRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async findCartByCustomerId(customerId: string): Promise<ReturnCart | null> {
    const data = await this.prismaService.cart.findFirst({
      where: {
        customerId,
        status: { in: ['ACTIVE', 'ABANDONED'] },
      },
      select: {
        id: true,
        customerId: true,
        couponId: true,
        discountAmount: true,
        coupon: {
          select: {
            code: true,
            type: true,
            value: true,
          },
        },
        items: {
          select: {
            id: true,
            productVariantId: true,
            quantity: true,
            productVariant: {
              select: {
                id: true,
                price: true,
                discountPrice: true,
                discountPix: true,
                productId: true,
                product: {
                  select: {
                    name: true,
                    slug: true,
                  },
                },
                productImage: {
                  where: {
                    OR: [
                      { mobileImageFirst: true },
                      { desktopImageFirst: true },
                    ],
                  },
                  select: {
                    desktopImageUrl: true,
                    mobileImageUrl: true,
                    desktopImageFirst: true,
                    mobileImageFirst: true,
                  },
                  take: 2,
                },
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
              },
            },
          },
        },
      },
    });

    if (!data) return null;

    // Monta os items do carrinho
    const items = await Promise.all(
      (data.items || []).map(async (item: any) => {
        const productVariant = item.productVariant || {};
        const product = productVariant.product || {};
        const price = productVariant.price ?? 0;
        const discountPrice = productVariant.discountPrice ?? null;
        const discountPix = productVariant.discountPix ?? null;

        // Verifica se a variação tem imagem
        let desktopImageUrl = productVariant.productImage?.find(
          (img: any) => img.desktopImageFirst,
        )?.desktopImageUrl;
        let mobileImageUrl = productVariant.productImage?.find(
          (img: any) => img.mobileImageFirst,
        )?.mobileImageUrl;

        // Se não tiver imagem, busca a primeira variação do mesmo produto com imagem
        if (!desktopImageUrl || !mobileImageUrl) {
          const variantWithImage =
            await this.prismaService.productVariant.findFirst({
              where: {
                productId: productVariant.productId,
                id: { not: productVariant.id },
                productImage: {
                  some: {},
                },
              },
              select: {
                productImage: {
                  select: {
                    desktopImageUrl: true,
                    mobileImageUrl: true,
                    desktopImageFirst: true,
                    mobileImageFirst: true,
                  },
                  take: 2,
                },
              },
            });

          if (variantWithImage) {
            if (!desktopImageUrl) {
              desktopImageUrl =
                variantWithImage.productImage?.find(
                  (img: any) => img.desktopImageFirst,
                )?.desktopImageUrl ?? null;
            }
            if (!mobileImageUrl) {
              mobileImageUrl =
                variantWithImage.productImage?.find(
                  (img: any) => img.mobileImageFirst,
                )?.mobileImageUrl ?? null;
            }
          }
        }

        // Calcula subtotal
        const unitPrice = discountPix ?? discountPrice ?? price;
        const subtotal = Number(unitPrice) * Number(item.quantity);

        // Monta os atributos
        const attributes = (productVariant.productVariantAttributes || []).map(
          (attr: any) => ({
            id: attr.id,
            attributeValue: {
              id: attr.attributeValue.id,
              name: attr.attributeValue.name,
              value: attr.attributeValue.value,
              attribute: {
                id: attr.attributeValue.attribute.id,
                name: attr.attributeValue.attribute.name,
              },
            },
          }),
        );

        return new ReturnCartItem(
          item.id,
          item.productVariantId,
          product.slug ?? '',
          product.name ?? '',
          price,
          item.quantity,
          subtotal,
          {
            desktopImageUrl: desktopImageUrl ?? null,
            mobileImageUrl: mobileImageUrl ?? null,
          },
          attributes,
          discountPrice ?? null,
          discountPix ?? null,
        );
      }),
    );

    // Soma total dos itens
    const subtotal = items.reduce((sum: number, i: any) => sum + i.subtotal, 0);

    let discountAmount = 0;

    if (data.coupon) {
      discountAmount =
        data.coupon.type === CouponType.PERCENTAGE
          ? (subtotal * data.coupon.value) / 100
          : data.coupon.value;
    }

    // Aplica desconto do cupom se existir
    const totalWithDiscount = Math.max(0, subtotal - discountAmount);

    return new ReturnCart(
      data.id,
      data.customerId,
      items,
      subtotal,
      discountAmount,
      totalWithDiscount,
      data.coupon?.code,
    );
  }

  async createCart(customerId: string): Promise<{ id: string }> {
    try {
      const cart = await this.prismaService.cart.create({
        data: {
          id: generateId(),
          customerId,
        },
      });

      return { id: cart.id };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Erro ao criar carrinho');
    }
  }

  async addItem(item: CreateCartItem): Promise<void> {
    try {
      await this.prismaService.cartItem.create({
        data: {
          id: generateId(),
          cartId: item.cartId,
          productVariantId: item.productVariantId,
          quantity: item.quantity,
        },
      });

      await this.prismaService.cart.update({
        where: { id: item.cartId },
        data: {
          lastItemAddedAt: new Date(),
        },
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Erro ao adicionar item ao carrinho');
    }
  }

  async updateItemQuantity(
    cartItemId: string,
    quantity: number,
  ): Promise<void> {
    try {
      await this.prismaService.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Erro ao atualizar quantidade do item');
    }
  }

  async updateCartStatus(cartId: string, status: CartStatus): Promise<void> {
    try {
      await this.prismaService.cart.update({
        where: { id: cartId },
        data: { status },
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Erro ao atualizar status do carrinho');
    }
  }

  async removeItem(cartItemId: string): Promise<void> {
    try {
      const cartItem = await this.prismaService.cartItem.delete({
        where: { id: cartItemId },
      });

      const cart = await this.prismaService.cart.findFirst({
        where: {
          id: cartItem.cartId,
          status: { in: ['ACTIVE', 'ABANDONED'] },
        },
        select: {
          items: true,
        },
      });

      if (cart?.items.length === 0) {
        await this.prismaService.cart.delete({
          where: { id: cartItem.cartId },
        });
      }
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Erro ao remover item do carrinho');
    }
  }

  async clearCart(cartId: string): Promise<void> {
    try {
      await this.prismaService.cartItem.deleteMany({
        where: { cartId },
      });

      await this.prismaService.cart.delete({
        where: { id: cartId },
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Erro ao limpar carrinho');
    }
  }
}
