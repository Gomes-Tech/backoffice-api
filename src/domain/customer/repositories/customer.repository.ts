import { BaseRepository } from '@domain/common';
import { CreateUser, Customer, ReturnCustomer, UpdateUser } from '../entities';

export abstract class CustomerRepository extends BaseRepository<
  Customer,
  CreateUser,
  UpdateUser,
  ReturnCustomer,
  ReturnCustomer
> {
  abstract findByEmail(email: string): Promise<Customer>;
}
