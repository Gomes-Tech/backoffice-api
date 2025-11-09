import {
  Attribute,
  AttributeRepository,
  CreateAttribute,
  UpdateAttribute,
} from '@domain/attribute';
import { BadRequestException, NotFoundException } from '@infra/filters';
// import { AdvancedLoggerService } from '@infra/logger';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaAttributeRepository extends AttributeRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async findAll(): Promise<Attribute[]> {
    try {
      const data = await this.prismaService.attribute.findMany({
        where: {
          isDeleted: false,
        },
        select: {
          id: true,
          name: true,
        },
      });

      return data;
    } catch (error) {
      throw error;
    }
  }

  async findById(id: string): Promise<Attribute> {
    try {
      const attribute = await this.prismaService.attribute.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
        },
      });

      return attribute;
    } catch (error) {
      throw error;
    }
  }

  async findByName(name: string): Promise<Attribute> {
    try {
      const attribute = await this.prismaService.attribute.findUnique({
        where: {
          name,
        },
        select: {
          id: true,
          name: true,
        },
      });

      return attribute;
    } catch (error) {
      // this.logger.logDatabaseError('findByName', error as Error, {
      //   attributeName: name,
      // });
      throw error;
    }
  }

  async create(dto: CreateAttribute): Promise<void> {
    try {
      await this.prismaService.attribute.create({
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

      throw new BadRequestException('Erro ao criar o atributo');
    }
  }

  async update(id: string, dto: UpdateAttribute): Promise<void> {
    try {
      const { name, updatedBy } = dto;

      const data: Record<string, any> = {
        ...(name !== undefined && { name }),
        updatedBy: {
          connect: { id: updatedBy },
        },
      };

      await this.prismaService.attribute.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Atributo não encontrado.');
      }

      throw new BadRequestException('Erro ao atualizar o atributo');
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      await this.prismaService.attribute.update({
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
        throw new NotFoundException('Atributo não encontrado.');
      }

      throw new BadRequestException('Erro ao deletar o atributo');
    }
  }
}
