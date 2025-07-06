import { TokenPasswordRepository } from '@domain/token-password';
import { CryptographyService } from '@infra/criptography';
import { MailService } from '@infra/providers';
import { Inject, Injectable } from '@nestjs/common';
import { generateToken } from '@shared/utils';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateTokenPasswordUseCase {
  constructor(
    @Inject('TokenPasswordRepository')
    private readonly tokenPasswordRepository: TokenPasswordRepository,
    private readonly cryptographyService: CryptographyService,
    private readonly mailService: MailService,
  ) {}

  async execute(email: string): Promise<void> {
    const generatedToken = generateToken();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

    const encriptToken = await this.cryptographyService.hash(generatedToken);
    await this.tokenPasswordRepository.createToken({
      id: uuidv4(),
      email: email,
      token: encriptToken,
      expiresAt,
    });

    await this.mailService.sendMail({
      to: email,
      subject: 'Recuperação de senha',
      template: 'reset-password',
      context: { token: generatedToken },
    });
  }
}
