import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

const ProductOrderBy = {
  MIN_PRICE: 'minPrice',
  MAX_PRICE: 'maxPrice',
  BEST_SELLERS: 'bestSellers',
} as const;

type ProductOrderByType = (typeof ProductOrderBy)[keyof typeof ProductOrderBy];

export class FindProductsFilterDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(
    ({ value }) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return [];
        }
      }
      return value;
    },
    { toClassOnly: true },
  )
  categories?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(
    ({ value }) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return [];
        }
      }
      return value;
    },
    { toClassOnly: true },
  )
  attributeValueIds?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  take?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  skip?: number;

  @IsOptional()
  @IsEnum(ProductOrderBy)
  orderBy?: ProductOrderByType;
}
