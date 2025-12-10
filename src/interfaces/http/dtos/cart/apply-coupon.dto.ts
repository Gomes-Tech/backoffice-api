import { IsNotEmpty, IsString } from 'class-validator';

export class ApplyCouponDTO {
  @IsNotEmpty()
  @IsString()
  code: string;
}

