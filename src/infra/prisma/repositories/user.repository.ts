import { ListUser, User, UserRepository } from '@domain/user';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<ListUser[]> {
    const data = await this.prismaService.user.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    return data.map((user) => ({
      ...user,
      role: user.role.name,
    }));
  }

  async findById(id: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        isActive: true,
        photo: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return new User(
      user.id,
      user.name,
      user.email,
      user.password,
      user.role.name,
      user.isActive,
      user.photo,
    );
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { email, isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        isActive: true,
        photo: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      ...user,
      role: user.role.name,
    };
  }

  async create(user: User): Promise<User> {
    const createdUser = await this.prismaService.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        photo: user.photo,
        role: {
          connect: {
            id: user.role,
          },
        },
      },
      include: {
        role: {
          select: {
            name: true,
          },
        },
      },
    });
    return new User(
      createdUser.id,
      createdUser.name,
      createdUser.email,
      createdUser.password,
      createdUser.role.name,
      createdUser.isActive,
      createdUser.photo,
    );
  }
  async update(id: string, user: Partial<User>): Promise<User> {
    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: {
        ...user,
        role: {
          connect: {
            id: user.role,
          },
        },
      },
      include: {
        role: {
          select: {
            name: true,
          },
        },
      },
    });
    return new User(
      updatedUser.id,
      updatedUser.name,
      updatedUser.email,
      updatedUser.password,
      updatedUser.role.name,
      updatedUser.isActive,
      updatedUser.photo,
    );
  }

  async resetPassword(id: string, password: string): Promise<void> {
    await this.prismaService.user.update({
      where: { id },
      data: {
        password,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.user.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }
}
