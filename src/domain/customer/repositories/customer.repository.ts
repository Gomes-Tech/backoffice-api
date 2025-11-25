import { BaseRepository } from '@domain/common';
import { CreateUser, Customer, ReturnCustomer, UpdateUser } from '../entities';

export abstract class CustomerRepository extends BaseRepository<
  Customer,
  CreateUser,
  UpdateUser,
  ReturnCustomer,
  ReturnCustomer
> {
  abstract findByEmail(
    email: string,
  ): Promise<Pick<Customer, 'id' | 'name' | 'email' | 'password'>>;
  abstract findMe(id: string): Promise<{
    name: string;
    email: string;
    phone: string;
    taxIdentifier: string;
    birthDate: string;
  }>;
  abstract findByTaxIdentifier(taxIdentifier: string): Promise<{ id: string }>;
}
