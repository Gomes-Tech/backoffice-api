import { CustomerRepository, ReturnCustomer } from '@domain/customer';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindCustomerByIdUseCase {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(id: string): Promise<ReturnCustomer> {
    const Customer = await this.customerRepository.findById(id);

    if (!Customer) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return Customer;
  }
}
