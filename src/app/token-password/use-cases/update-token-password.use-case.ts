import { TokenPasswordRepository } from '@domain/token-password';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UpdateTokenPasswordUseCase {
  constructor(
    @Inject('TokenPasswordRepository')
    private readonly tokenPasswordRepository: TokenPasswordRepository,
  ) {}

  async execute(email: string) {
    await this.tokenPasswordRepository.updateToken(email);
  }
}
