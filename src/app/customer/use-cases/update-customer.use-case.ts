import { CustomerRepository } from '@domain/customer';
import { CryptographyService } from '@infra/criptography';
import { BadRequestException } from '@infra/filters';
import { UpdateUserDto } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';
import { FindCustomerByEmailUseCase } from './find-customer-by-email.use-case';
import { FindCustomerByIdUseCase } from './find-customer-by-id.use-case';

@Injectable()
export class UpdateCustomerUseCase {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
    private readonly findCustomerByIdUseCase: FindCustomerByIdUseCase,
    private readonly findCustomerByEmailUseCase: FindCustomerByEmailUseCase,
    private readonly cryptographyService: CryptographyService,
  ) {}

  async execute(id: string, data: UpdateUserDto): Promise<void> {
    const { email } = await this.findCustomerByIdUseCase.execute(id);
    const user = await this.findCustomerByEmailUseCase.execute(email);

    if (data.password) {
      const samePassword = await this.cryptographyService.compare(
        data.password,
        user.password,
      );

      if (samePassword) {
        throw new BadRequestException(
          'Utilize uma senha não usada anteriormente!',
        );
      }

      data.password = await this.cryptographyService.hash(data.password);
    }

    await this.customerRepository.update(id, data, '');
  }
}
