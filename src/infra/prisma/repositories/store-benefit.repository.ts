import {
  CreateStoreBenefit,
  ListStoreBenefit,
  StoreBenefit,
  StoreBenefitRepository,
  StoreBenefitType,
  UpdateStoreBenefit,
} from '@domain/store-benefit';
import { BadRequestException, NotFoundException } from '@infra/filters';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaStoreBenefitRepository extends StoreBenefitRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async findAll(): Promise<ListStoreBenefit[]> {
    const data = await this.prismaService.storeBenefit.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        order: 'asc',
      },
      select: {
        id: true,
        title: true,
        subtitle: true,
        type: true,
        imageUrl: true,
        imageKey: true,
        modalContent: true,
        link: true,
        linkText: true,
        order: true,
        createdAt: true,
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });

    return data.map(
      (item) =>
        new ListStoreBenefit(
          item.id,
          item.title,
          item.subtitle ?? null,
          (item.type as StoreBenefitType | null) ?? null,
          item.imageUrl ?? null,
          item.imageKey ?? null,
          item.modalContent ?? null,
          item.link ?? null,
          item.linkText ?? null,
          item.order,
          item.createdAt,
          item.createdBy.name,
        ),
    );
  }

  async list(): Promise<StoreBenefit[]> {
    const data = await this.prismaService.storeBenefit.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        order: 'asc',
      },
      select: {
        id: true,
        title: true,
        subtitle: true,
        type: true,
        imageUrl: true,
        imageKey: true,
        modalContent: true,
        link: true,
        linkText: true,
        order: true,
        createdAt: true,
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });

    return data.map(
      (item) =>
        new StoreBenefit(
          item.id,
          item.title,
          item.subtitle ?? null,
          (item.type as StoreBenefitType | null) ?? null,
          item.imageUrl ?? null,
          item.imageKey ?? null,
          item.modalContent,
          item.link,
          item.linkText,
          item.order,
          item.createdAt,
          item.createdBy.name,
        ),
    );
  }

  async findById(id: string): Promise<StoreBenefit | null> {
    const item = await this.prismaService.storeBenefit.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      select: {
        id: true,
        title: true,
        subtitle: true,
        type: true,
        imageUrl: true,
        imageKey: true,
        modalContent: true,
        link: true,
        linkText: true,
        order: true,
        createdAt: true,
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!item) return null;

    return new StoreBenefit(
      item.id,
      item.title,
      item.subtitle ?? null,
      (item.type as StoreBenefitType | null) ?? null,
      item.imageUrl ?? null,
      item.imageKey ?? null,
      item.modalContent,
      item.link,
      item.linkText,
      item.order,
      item.createdAt,
      item.createdBy.name,
    );
  }

  async create(dto: CreateStoreBenefit): Promise<void> {
    try {
      await this.prismaService.storeBenefit.create({
        data: {
          id: dto.id,
          title: dto.title,
          subtitle: dto.subtitle,
          type: dto.type ?? null,
          imageUrl: dto.imageUrl ?? null,
          imageKey: dto.imageKey ?? null,
          modalContent: dto.modalContent ?? null,
          link: dto.link ?? null,
          linkText: dto.linkText ?? null,
          order: dto.order,
          createdBy: {
            connect: {
              id: dto.createdBy,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(dto.createdBy + ' não encontrado.');
      }

      throw new BadRequestException(
        'Erro ao criar benefício da loja: ' + error.message,
      );
    }
  }

  async update(id: string, dto: UpdateStoreBenefit): Promise<void> {
    try {
      const existing = await this.prismaService.storeBenefit.findFirst({
        where: { id, isDeleted: false },
      });

      if (!existing) {
        throw new NotFoundException('Benefício não encontrado');
      }

      const {
        title,
        subtitle,
        type,
        imageUrl,
        imageKey,
        modalContent,
        link,
        linkText,
        order,
        updatedBy,
      } = dto;

      const data: Prisma.StoreBenefitUpdateInput = {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(type !== undefined && { type }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(imageKey !== undefined && { imageKey }),
        ...(modalContent !== undefined && { modalContent }),
        ...(link !== undefined && { link }),
        ...(linkText !== undefined && { linkText }),
        ...(order !== undefined && { order }),
        ...(updatedBy && {
          updatedBy: {
            connect: { id: updatedBy },
          },
        }),
      };

      await this.prismaService.storeBenefit.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Benefício não encontrado.');
      }

      throw new BadRequestException(
        'Erro ao atualizar benefício da loja: ' + error.message,
      );
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const existing = await this.prismaService.storeBenefit.findFirst({
        where: { id, isDeleted: false },
      });

      if (!existing) {
        throw new NotFoundException('Benefício não encontrado');
      }

      await this.prismaService.storeBenefit.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedBy: {
            connect: { id: userId },
          },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Benefício não encontrado.');
      }

      throw new BadRequestException(
        'Erro ao excluir benefício da loja: ' + error.message,
      );
    }
  }
}
