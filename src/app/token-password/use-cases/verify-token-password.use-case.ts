import { TokenPasswordRepository } from '@domain/token-password';
import { CryptographyService } from '@infra/criptography';
import { BadRequestException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class VerifyTokenPasswordUseCase {
  constructor(
    @Inject('TokenPasswordRepository')
    private readonly tokenPasswordRepository: TokenPasswordRepository,
    private readonly cryptographyService: CryptographyService,
  ) {}

  async execute(email: string, token: string) {
    const tokens = await this.tokenPasswordRepository.verifyToken(email);

    for (const tokenRecord of tokens) {
      const isMatch = await this.cryptographyService.compare(
        token,
        tokenRecord.token,
      );
      if (isMatch) return true;
    }

    throw new BadRequestException('Token inválido ou expirado!');
  }
}
