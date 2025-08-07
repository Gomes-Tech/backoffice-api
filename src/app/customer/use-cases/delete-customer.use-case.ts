import { CustomerRepository } from '@domain/customer';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteCustomerUseCase {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(id: string): Promise<void> {
    await this.customerRepository.findById(id);

    await this.customerRepository.delete(id, '');
  }
}
