import { Wishlist, WishlistItem, WishlistRepository } from '@domain/wishlist';
import { BadRequestException } from '@infra/filters';
import { Injectable } from '@nestjs/common';
import { generateId } from '@shared/utils';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaWishlistRepository extends WishlistRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByCustomerId(customerId: string): Promise<Wishlist> {
    try {
      const wishlist = await this.prisma.wishlist.findUnique({
        where: { customerId },
        select: {
          id: true,
          customerId: true,
          items: {
            select: {
              id: true,
              productId: true,
              wishlistId: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  productVariants: {
                    take: 1,
                    where: { isActive: true, isDeleted: false },
                    select: {
                      price: true,
                      discountPrice: true,
                      isActive: true,
                      productImage: {
                        select: {
                          desktopImageUrl: true,
                          mobileImageUrl: true,
                        },
                        take: 1,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!wishlist) return null;

      return new Wishlist(
        wishlist.id,
        wishlist.customerId,
        wishlist.items.map((item: any) => {
          const variant = item.product.productVariants?.[0];
          return new WishlistItem(
            item.id,
            item.wishlistId,
            item.productId,
            item.product.name,
            item.product.slug,
            variant?.price ?? 0,
            Number(variant?.discountPrice ?? 0),
            variant?.isActive ?? false,
            {
              desktopImageUrl:
                variant?.productImage?.[0]?.desktopImageUrl ?? '',
              mobileImageUrl: variant?.productImage?.[0]?.mobileImageUrl ?? '',
            },
          );
        }),
      );
    } catch (error) {
      throw new BadRequestException('Erro ao buscar wishlist');
    }
  }

  async create(customerId: string): Promise<{ id: string }> {
    try {
      const wishlist = await this.prisma.wishlist.create({
        data: {
          id: generateId(),
          customerId,
        },
      });

      return { id: wishlist.id };
    } catch (error) {
      throw new BadRequestException('Erro ao criar wishlist');
    }
  }

  async addItem(id: string, productId: string): Promise<void> {
    try {
      await this.prisma.wishlistItem.create({
        data: {
          id: generateId(),
          wishlistId: id,
          productId,
        },
      });
    } catch (error) {
      throw new BadRequestException('Erro ao adicionar item à wishlist');
    }
  }

  async removeItem(itemId: string): Promise<void> {
    try {
      await this.prisma.wishlistItem.delete({
        where: { id: itemId },
      });
    } catch (error) {
      throw new BadRequestException('Erro ao remover item da wishlist');
    }
  }

  async clear(wishlistId: string): Promise<void> {
    try {
      await this.prisma.$transaction([
        this.prisma.wishlistItem.deleteMany({
          where: { wishlistId },
        }),
        this.prisma.wishlist.delete({
          where: { id: wishlistId },
        }),
      ]);
    } catch (error) {
      throw new BadRequestException('Erro ao limpar wishlist');
    }
  }
}
