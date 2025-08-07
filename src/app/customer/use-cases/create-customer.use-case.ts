import { Customer, CustomerRepository } from '@domain/customer';
import { CryptographyService } from '@infra/criptography';
import { CreateCustomerDTO } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
    private readonly cryptographyService: CryptographyService,
  ) {}

  async execute(dto: CreateCustomerDTO): Promise<void> {
    const passwordHashed = await this.cryptographyService.hash(dto.password);

    const customer = new Customer(
      uuidv4(),
      dto.name,
      dto.email,
      passwordHashed,
    );

    await this.customerRepository.create(customer);
  }
}
