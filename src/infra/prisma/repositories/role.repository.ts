import { CreateRole, Role, RoleRepository, UpdateRole } from '@domain/role';
import { BadRequestException, NotFoundException } from '@infra/filters';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaRoleRepository extends RoleRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async findAll(): Promise<Role[]> {
    const data = await this.prismaService.role.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        isActive: true,
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });

    return data.map((item) => ({
      ...item,
      createdBy: item.createdBy.name,
    }));
  }

  async findById(
    id: string,
  ): Promise<Omit<Role, 'createdBy' | 'createdAt'> | null> {
    return await this.prismaService.role.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
      },
    });
  }

  async create(dto: CreateRole): Promise<void> {
    try {
      await this.prismaService.role.create({
        data: {
          ...dto,
          createdBy: {
            connect: { id: dto.createdBy },
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
        'Erro ao criar permissão: ' + error.message,
      );
    }
  }

  async update(id: string, dto: UpdateRole): Promise<void> {
    try {
      const { name, description, isActive, updatedBy } = dto;

      const data: Record<string, any> = {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
        updatedBy: {
          connect: { id: updatedBy },
        },
      };

      await this.prismaService.role.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Menu não encontrado.');
      }

      throw new BadRequestException(
        'Erro ao atualizar a permissão: ' + error.message,
      );
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      await this.prismaService.role.update({
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
        throw new NotFoundException('Permissão não encontrada.');
      }

      throw new BadRequestException(
        'Erro ao atualizar a permissão: ' + error.message,
      );
    }
  }
}
