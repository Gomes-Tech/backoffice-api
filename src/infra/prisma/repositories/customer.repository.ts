import {
  CreateUser,
  CustomerRepository,
  ReturnCustomer,
  UpdateUser,
} from '@domain/customer';
import { BadRequestException } from '@infra/filters';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaCustomerRepository extends CustomerRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async findAll(): Promise<ReturnCustomer[]> {
    return await this.prismaService.customer.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  async findById(id: string): Promise<ReturnCustomer> {
    return await this.prismaService.customer.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  async findMe(id: string): Promise<{ name: string }> {
    return await this.prismaService.customer.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      select: {
        name: true,
      },
    });
  }

  async findByEmail(
    email: string,
  ): Promise<{ id: string; email: string; password: string }> {
    return await this.prismaService.customer.findFirst({
      where: {
        email,
        isDeleted: false,
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });
  }

  async create(dto: CreateUser): Promise<void> {
    try {
      await this.prismaService.customer.create({
        data: { ...dto },
      });
    } catch (error) {
      throw new BadRequestException('Erro ao criar usuário');
    }
  }

  async update(id: string, dto: UpdateUser, userId: string): Promise<void> {
    try {
      const { name, password } = dto;

      const data: Record<string, any> = {
        ...(name !== undefined && { name }),
        ...(password !== undefined && { password }),
      };

      await this.prismaService.customer.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new BadRequestException(
        'Erro ao atualizar seus dados: ' + error.message,
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prismaService.customer.update({
        where: { id },
        data: {
          isDeleted: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(
        'Erro ao excluir o cliente: ' + error.message,
      );
    }
  }
}
