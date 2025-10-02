import { CustomerRepository } from '@domain/customer';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindCustomerByEmailUseCase {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(
    email: string,
  ): Promise<{ id: string; email: string; password: string } | null> {
    const customerExist = await this.customerRepository.findByEmail(email);

    if (!customerExist) {
      throw new NotFoundException('Cliente não encontrado!');
    }

    return customerExist;
  }
}
