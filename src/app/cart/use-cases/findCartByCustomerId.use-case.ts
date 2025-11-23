import { CartRepository, ReturnCart } from '@domain/cart';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindCartByCustomerIdUseCase {
  constructor(
    @Inject('CartRepository')
    private readonly cartRepository: CartRepository,
  ) {}

  async execute(customerId: string): Promise<ReturnCart | null> {
    return await this.cartRepository.findCartByCustomerId(customerId);
  }
}
