import { FindMeUseCase } from '@app/customer';
import { AuthType, CustomerId } from '@interfaces/http/decorators';
import { Controller, Get } from '@nestjs/common';

@AuthType(['customer'])
@Controller('customers')
export class CustomerController {
  constructor(private readonly findMeUseCase: FindMeUseCase) {}

  @Get('me')
  async findMe(@CustomerId() customerId: string) {
    return await this.findMeUseCase.execute(customerId);
  }
}
