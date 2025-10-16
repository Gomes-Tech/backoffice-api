import {
  Attribute,
  AttributeRepository,
  CreateAttribute,
  UpdateAttribute,
} from '@domain/attribute';
import { BadRequestException, NotFoundException } from '@infra/filters';
import { AdvancedLoggerService } from '@infra/logger';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaAttributeRepository extends AttributeRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: AdvancedLoggerService,
  ) {
    super();
    this.logger.setContext('PrismaAttributeRepository');
  }

  async findAll(): Promise<Attribute[]> {
    const startTime = Date.now();
    this.logger.log('Buscando todos os atributos');
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

      const duration = Date.now() - startTime;
      this.logger.logPerformance('findAll', duration, {
        totalAttribute: data.length,
      });

      return data;
    } catch (error) {
      this.logger.logDatabaseError('findAll', error as Error);
      throw error;
    }
  }

  async findById(id: string): Promise<Attribute> {
    const startTime = Date.now();
    this.logger.log(`Buscando atributo por ID: ${id}`);

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

      const duration = Date.now() - startTime;

      if (attribute) {
        this.logger.logPerformance('findById', duration, {
          attributeId: id,
          found: true,
        });
      } else {
        this.logger.warn(`Atributo não encontrado: ${id}`);
        this.logger.logPerformance('findById', duration, {
          attributeId: id,
          found: false,
        });
      }

      return attribute;
    } catch (error) {
      this.logger.logDatabaseError('findById', error as Error, {
        attributeId: id,
      });
      throw error;
    }
  }

  async findByName(name: string): Promise<Attribute> {
    const startTime = Date.now();
    this.logger.log(`Buscando atributo por NOME: ${name}`);

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
      const duration = Date.now() - startTime;

      if (attribute) {
        this.logger.logPerformance('findById', duration, {
          attributeName: name,
          found: true,
        });
      } else {
        this.logger.warn(`Atributo não encontrado: ${name}`);
        this.logger.logPerformance('findByName', duration, {
          attributeName: name,
          found: false,
        });
      }

      return attribute;
    } catch (error) {
      this.logger.logDatabaseError('findByName', error as Error, {
        attributeName: name,
      });
      throw error;
    }
  }

  async create(dto: CreateAttribute): Promise<void> {
    const startTime = Date.now();
    this.logger.log('Criando novo atributo');
    this.logger.debug(`Dados do atributo: ${JSON.stringify(dto)}`);
    try {
      await this.prismaService.attribute.create({
        data: {
          ...dto,
          createdBy: {
            connect: { id: dto.createdBy },
          },
        },
      });

      const duration = Date.now() - startTime;
      this.logger.logPerformance('create', duration, {
        attributeName: dto.name,
        createdBy: dto.createdBy,
      });

      this.logger.log(`atributo criado com sucesso: ${dto.name}`);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(dto.createdBy + ' não encontrado.');
      }

      this.logger.logDatabaseError('create', error as Error, {
        attributeName: dto.name,
      });

      throw new BadRequestException('Erro ao criar o atributo');
    }
  }

  async update(id: string, dto: UpdateAttribute): Promise<void> {
    const startTime = Date.now();
    this.logger.log(`Atualizando atributo: ${id}`);
    this.logger.debug(`Dados de atualização: ${JSON.stringify(dto)}`);

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

      const duration = Date.now() - startTime;
      this.logger.logPerformance('update', duration, {
        attributeId: id,
        attributeName: name,
        updatedBy,
      });

      this.logger.log(`Atributo atualizado com sucesso: ${id}`);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        this.logger.warn(`Tentativa de atualizar atributo inexistente: ${id}`);
        throw new NotFoundException('Atributo não encontrado.');
      }

      this.logger.logDatabaseError('update', error as Error, {
        attributeId: id,
      });

      throw new BadRequestException('Erro ao atualizar o atributo');
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    const startTime = Date.now();
    this.logger.log(`Deletando atributo: ${id}`);
    this.logger.debug(`Usuário responsável pela exclusão: ${userId}`);

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

      const duration = Date.now() - startTime;
      this.logger.logPerformance('delete', duration, {
        attributeId: id,
        deletedBy: userId,
      });

      this.logger.log(`Atributo deletado com sucesso: ${id}`);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        this.logger.warn(`Tentativa de deletar atributo inexistente: ${id}`);
        throw new NotFoundException('Atributo não encontrado.');
      }

      this.logger.logDatabaseError('delete', error as Error, {
        attributeId: id,
        userId,
      });

      throw new BadRequestException('Erro ao deletar o atributo');
    }
  }
}
