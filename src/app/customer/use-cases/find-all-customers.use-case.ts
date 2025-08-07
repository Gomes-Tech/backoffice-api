import { CustomerRepository, ReturnCustomer } from '@domain/customer';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAllCustomersUseCase {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(): Promise<ReturnCustomer[]> {
    const customers = await this.customerRepository.findAll();

    return customers;
  }
}
