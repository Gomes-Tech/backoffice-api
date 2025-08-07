import { IsOptional, IsString } from 'class-validator';

export class UpdateCustomer {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
