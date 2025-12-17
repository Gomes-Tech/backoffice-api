import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { StoreBenefitType } from '@domain/store-benefit';

export class UpdateStoreBenefitDTO {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsEnum(StoreBenefitType)
  type?: StoreBenefitType;

  @IsOptional()
  @IsString()
  modalContent?: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsString()
  linkText?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}


