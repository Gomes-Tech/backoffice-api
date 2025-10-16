import {
  AttributeValue,
  AttributeValueRepository,
  AttributeValueWithAttribute,
  CreateAttributeValue,
  ListAttributeValue,
  UpdateAttributeValue,
} from '@domain/attribute-value';
import { BadRequestException, NotFoundException } from '@infra/filters';
import { AdvancedLoggerService } from '@infra/logger';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaAttributeValueRepository extends AttributeValueRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: AdvancedLoggerService,
  ) {
    super();
    this.logger.setContext('PrismaAttributeValueRepository');
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
    const startTime = Date.now();
    this.logger.log(`Buscando AttributeValue por ID: ${id}`);

    try {
      const attributeValue = await this.prismaService.attributeValue.findUnique(
        {
          where: { id, isDeleted: false },
          select: {
            id: true,
            name: true,
            value: true,
          },
        },
      );

      const duration = Date.now() - startTime;

      if (attributeValue) {
        this.logger.logPerformance('findById', duration, {
          attributeValueId: id,
          found: true,
        });
      } else {
        this.logger.warn(`AttributeValue não encontrado: ${id}`);
        this.logger.logPerformance('findById', duration, {
          attributeValueId: id,
          found: false,
        });
      }

      return attributeValue;
    } catch (error) {
      this.logger.logDatabaseError('findById', error as Error, {
        attributeName: id,
      });
      throw error;
    }
  }

  async findByName(name: string): Promise<AttributeValue> {
    const startTime = Date.now();
    this.logger.log(`Buscando atributo por NOME: ${name}`);

    try {
      const attributeValue = await this.prismaService.attributeValue.findUnique(
        {
          where: { name, isDeleted: false },
          select: {
            id: true,
            name: true,
            value: true,
          },
        },
      );

      const duration = Date.now() - startTime;

      if (attributeValue) {
        this.logger.logPerformance('findByName', duration, {
          attributeValueName: name,
          found: true,
        });
      } else {
        this.logger.warn(`Atributo não encontrado: ${name}`);
        this.logger.logPerformance('findByName', duration, {
          attributeValueName: name,
          found: false,
        });
      }

      return attributeValue;
    } catch (error) {
      this.logger.logDatabaseError('findByName', error as Error, {
        attributeValueName: name,
      });
      throw error;
    }
  }

  async findByValue(value: string): Promise<AttributeValue> {
    const startTime = Date.now();
    this.logger.log(`Buscando atributo por VALOR: ${value}`);

    try {
      const attributeValue = await this.prismaService.attributeValue.findUnique(
        {
          where: { value, isDeleted: false },
          select: {
            id: true,
            name: true,
            value: true,
          },
        },
      );

      const duration = Date.now() - startTime;

      if (attributeValue) {
        this.logger.logPerformance('findByValue', duration, {
          attributeValueValue: value,
          found: true,
        });
      } else {
        this.logger.warn(`Atributo não encontrado: ${value}`);
        this.logger.logPerformance('findByValue', duration, {
          attributeValueName: value,
          found: false,
        });
      }

      return attributeValue;
    } catch (error) {
      this.logger.logDatabaseError('findByValue', error as Error, {
        attributeValueName: value,
      });
      throw error;
    }
  }

  async create(dto: CreateAttributeValue): Promise<void> {
    const startTime = Date.now();
    this.logger.log('Criando novo atributo valor');
    this.logger.debug(`Dados do atributo valor: ${JSON.stringify(dto)}`);
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

      const duration = Date.now() - startTime;
      this.logger.logPerformance('create', duration, {
        attributeValueName: dto.name,
        createdBy: dto.createdBy,
      });

      this.logger.log(`atributo valor criado com sucesso: ${dto.name}`);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(dto.createdBy + ' não encontrado.');
      }

      this.logger.logDatabaseError('create', error as Error, {
        attributeValueName: dto.name,
      });

      throw new BadRequestException('Erro ao criar o valor do atributo');
    }
  }

  async update(id: string, dto: UpdateAttributeValue): Promise<void> {
    const startTime = Date.now();
    this.logger.log(`Atualizando atributo valor: ${id}`);
    this.logger.debug(`Dados de atualização: ${JSON.stringify(dto)}`);

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

      const duration = Date.now() - startTime;
      this.logger.logPerformance('update', duration, {
        attributeValueId: id,
        attributeName: name,
        updatedBy,
      });

      this.logger.log(`Atributo valor atualizado com sucesso: ${id}`);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        this.logger.warn(
          `Tentativa de atualizar valor atributo inexistente: ${id}`,
        );
        throw new NotFoundException('Valor Atributo não encontrado.');
      }

      this.logger.logDatabaseError('update', error as Error, {
        attributeValueId: id,
      });

      throw new BadRequestException('Erro ao atualizar o valor atributo');
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    const startTime = Date.now();
    this.logger.log(`Deletando atributo: ${id}`);
    this.logger.debug(`Usuário responsável pela exclusão: ${userId}`);

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

      const duration = Date.now() - startTime;
      this.logger.logPerformance('delete', duration, {
        attributeValueId: id,
        deletedBy: userId,
      });

      this.logger.log(`Atributo valor deletado com sucesso: ${id}`);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        this.logger.warn(
          `Tentativa de deletar atributo valor inexistente: ${id}`,
        );
        throw new NotFoundException('Valor atributo não encontrado.');
      }

      this.logger.logDatabaseError('delete', error as Error, {
        attributeValueId: id,
        userId,
      });

      throw new BadRequestException(
        'Erro ao deletar o valor atributo: ' + error.message,
      );
    }
  }
}
