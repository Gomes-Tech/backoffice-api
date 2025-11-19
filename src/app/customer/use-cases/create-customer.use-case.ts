import { CustomerRepository } from '@domain/customer';
import { CryptographyService } from '@infra/criptography';
import { CreateCustomerDTO } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';
import { generateId } from '@shared/utils';

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
    private readonly cryptographyService: CryptographyService,
  ) {}

  async execute(dto: CreateCustomerDTO): Promise<void> {
    const passwordHashed = await this.cryptographyService.hash(dto.password);

    await this.customerRepository.create({
      id: generateId(),
      name: dto.name,
      lastname: dto.lastname,
      birthDate: dto.birthDate,
      phone: dto.phone,
      taxIdentifier: dto.taxIdentifier,
      email: dto.email,
      password: passwordHashed,
    });
  }
}
