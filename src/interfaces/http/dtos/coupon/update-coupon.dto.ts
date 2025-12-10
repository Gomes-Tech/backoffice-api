import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CouponTypeDTO } from './create-coupon.dto';

export enum CouponStatusDTO {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
}

export class UpdateCouponDTO {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(CouponTypeDTO)
  type?: CouponTypeDTO;

  @IsOptional()
  @IsInt()
  @Min(1)
  value?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minPurchaseAmount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxDiscountAmount?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @IsOptional()
  isSingleUse?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(CouponStatusDTO)
  status?: CouponStatusDTO;
}
