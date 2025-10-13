import {
  CreateCustomerUseCase,
  DeleteCustomerUseCase,
  FindAllCustomersUseCase,
  FindCustomerByEmailUseCase,
  FindCustomerByIdUseCase,
  FindCustomerByTaxIdentifierUseCase,
  FindMeUseCase,
  UpdateCustomerUseCase,
} from '@app/customer';
import { PrismaCustomerRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';
import { CustomerController } from '../controllers';

@Module({
  imports: [],
  controllers: [CustomerController],
  providers: [
    FindAllCustomersUseCase,
    FindCustomerByIdUseCase,
    FindMeUseCase,
    FindCustomerByEmailUseCase,
    CreateCustomerUseCase,
    UpdateCustomerUseCase,
    DeleteCustomerUseCase,
    FindCustomerByTaxIdentifierUseCase,
    PrismaCustomerRepository,
    {
      provide: 'CustomerRepository',
      useExisting: PrismaCustomerRepository,
    },
  ],
  exports: [
    FindAllCustomersUseCase,
    FindCustomerByIdUseCase,
    FindCustomerByTaxIdentifierUseCase,
    FindCustomerByEmailUseCase,
    CreateCustomerUseCase,
    UpdateCustomerUseCase,
    DeleteCustomerUseCase,
    PrismaCustomerRepository,
    {
      provide: 'CustomerRepository',
      useExisting: PrismaCustomerRepository,
    },
  ],
})
export class CustomerModule {}
