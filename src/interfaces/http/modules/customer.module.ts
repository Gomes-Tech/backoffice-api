import {
  CreateCustomerUseCase,
  DeleteCustomerUseCase,
  FindAllCustomersUseCase,
  FindCustomerByEmailUseCase,
  FindCustomerByIdUseCase,
  UpdateCustomerUseCase,
} from '@app/customer';
import { PrismaCustomerRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [
    FindAllCustomersUseCase,
    FindCustomerByIdUseCase,
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
  exports: [
    FindAllCustomersUseCase,
    FindCustomerByIdUseCase,
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
