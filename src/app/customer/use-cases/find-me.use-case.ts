import { CustomerRepository } from '@domain/customer';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindMeUseCase {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(
    id: string,
  ): Promise<{
    name: string;
    email: string;
    phone: string;
    taxIdentifier: string;
    birthDate: string;
  }> {
    const customer = await this.customerRepository.findMe(id);

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return customer;
  }
}
