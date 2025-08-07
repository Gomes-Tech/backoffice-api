import { Customer, CustomerRepository } from '@domain/customer';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindCustomerByEmailUseCase {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(email: string): Promise<Customer | null> {
    const customerExist = await this.customerRepository.findByEmail(email);

    if (!customerExist) {
      throw new NotFoundException('Cliente não encontrado!');
    }

    return customerExist;
  }
}
