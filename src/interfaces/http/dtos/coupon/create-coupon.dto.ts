import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum CouponTypeDTO {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export class CreateCouponDTO {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsEnum(CouponTypeDTO)
  type: CouponTypeDTO;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  value: number; // Valor do desconto (percentual ou fixo em centavos)

  @IsOptional()
  @IsInt()
  @Min(0)
  minPurchaseAmount?: number; // Valor mínimo de compra em centavos

  @IsOptional()
  @IsInt()
  @Min(0)
  maxDiscountAmount?: number; // Valor máximo de desconto em centavos (para percentual)

  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number; // Limite de uso total

  @IsOptional()
  isSingleUse?: boolean; // Se true, cada cliente pode usar apenas uma vez

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

