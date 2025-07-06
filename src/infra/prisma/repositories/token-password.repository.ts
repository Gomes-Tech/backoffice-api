import { CreateToken, TokenPassword } from '@domain/token-password';
import { TokenPasswordRepository } from '@domain/token-password/repositories';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaTokenPasswordRepository extends TokenPasswordRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async verifyToken(email: string): Promise<TokenPassword[]> {
    return await this.prismaService.passwordResetToken.findMany({
      where: {
        email,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createToken(dto: CreateToken): Promise<void> {
    await this.prismaService.passwordResetToken.create({
      data: dto,
    });
  }

  async updateToken(email: string): Promise<void> {
    await this.prismaService.passwordResetToken.updateMany({
      where: {
        email,
      },
      data: {
        used: true,
      },
    });
  }
}
