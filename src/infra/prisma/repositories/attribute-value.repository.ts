import {
  AttributeValue,
  AttributeValueRepository,
  AttributeValueWithAttribute,
  CreateAttributeValue,
  ListAttributeValue,
  UpdateAttributeValue,
} from '@domain/attribute-value';
import { BadRequestException, NotFoundException } from '@infra/filters';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaAttributeValueRepository extends AttributeValueRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async findAll(): Promise<ListAttributeValue[]> {
    return await this.prismaService.attributeValue.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        value: true,
        attributeId: true,
      },
    });
  }

  async findWithAttributeId(
    atrrValueId: string,
  ): Promise<AttributeValueWithAttribute> {
    return await this.prismaService.attributeValue.findUnique({
      where: { id: atrrValueId },
      select: {
        id: true,
        attributeId: true,
      },
    });
  }

  async findAllByAttribute(attributeId: string): Promise<AttributeValue[]> {
    return await this.prismaService.attributeValue.findMany({
      where: {
        attributeId,
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        value: true,
      },
    });
  }

  async findById(id: string): Promise<AttributeValue> {
    return await this.prismaService.attributeValue.findUnique({
      where: { id, isDeleted: false },
      select: {
        id: true,
        name: true,
        value: true,
      },
    });
  }

  async findByName(name: string): Promise<AttributeValue> {
    return await this.prismaService.attributeValue.findUnique({
      where: { name, isDeleted: false },
      select: {
        id: true,
        name: true,
        value: true,
      },
    });
  }

  async findByValue(value: string): Promise<AttributeValue> {
    return await this.prismaService.attributeValue.findUnique({
      where: { value, isDeleted: false },
      select: {
        id: true,
        name: true,
        value: true,
      },
    });
  }

  async create(dto: CreateAttributeValue): Promise<void> {
    try {
      await this.prismaService.attributeValue.create({
        data: {
          ...dto,
          attribute: {
            connect: {
              id: dto.attribute,
            },
          },
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
        'Erro ao criar o valor do atributo: ' + error.message,
      );
    }
  }

  async update(id: string, dto: UpdateAttributeValue): Promise<void> {
    try {
      const { name, value, updatedBy } = dto;

      const data: Record<string, any> = {
        ...(name !== undefined && { name }),
        ...(value !== undefined && { value }),
        updatedBy: {
          connect: { id: updatedBy },
        },
      };

      await this.prismaService.attributeValue.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Valor Atributo não encontrado.');
      }

      throw new BadRequestException(
        'Erro ao atualizar o valor atributo: ' + error.message,
      );
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      await this.prismaService.attributeValue.update({
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
        throw new NotFoundException('Valor atributo não encontrado.');
      }

      throw new BadRequestException(
        'Erro ao deletar o valor atributo: ' + error.message,
      );
    }
  }
}
