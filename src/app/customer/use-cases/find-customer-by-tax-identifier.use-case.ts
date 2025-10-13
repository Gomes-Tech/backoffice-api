import { CustomerRepository } from '@domain/customer';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindCustomerByTaxIdentifierUseCase {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(taxIdentifier: string): Promise<{ id: string } | null> {
    const customerExist =
      await this.customerRepository.findByTaxIdentifier(taxIdentifier);

    if (!customerExist) {
      throw new NotFoundException('Usuário não encontrado!');
    }

    return customerExist;
  }
}
