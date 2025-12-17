import { StoreBenefitType } from '@domain/store-benefit';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateStoreBenefitDTO {
  @IsNotEmpty()
  @IsString()
  title: string;

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

  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  @IsInt()
  order: number;
}
