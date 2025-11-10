import { Transform, Type, plainToInstance } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UpdateProductDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  technicalInfo?: string;

  @IsOptional()
  @IsString()
  desktopImageFirst?: string;

  @IsOptional()
  @IsString()
  mobileImageFirst?: string;

  @IsOptional()
  @IsString()
  videoLink?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true, {
    toClassOnly: true,
  })
  isGreenSeal?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true, {
    toClassOnly: true,
  })
  freeShipping?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true, {
    toClassOnly: true,
  })
  immediateShipping?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true, {
    toClassOnly: true,
  })
  isPersonalized?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true, {
    toClassOnly: true,
  })
  isExclusive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true, {
    toClassOnly: true,
  })
  inCutout?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => parseArray(value), { toClassOnly: true })
  categories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => parseArray(value), { toClassOnly: true })
  relatedProducts?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => parseArray(value), { toClassOnly: true })
  similarProducts?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductFAQItem)
  @Transform(({ value }) => parseNestedArray(value, ProductFAQItem), {
    toClassOnly: true,
  })
  productFAQ?: ProductFAQItem[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariant)
  @Transform(({ value }) => parseNestedArray(value, ProductVariant), {
    toClassOnly: true,
  })
  productVariants?: ProductVariant[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => parseArray(value), { toClassOnly: true })
  mobileImages: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => parseArray(value), { toClassOnly: true })
  desktopImages: string[];

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;

  @IsOptional()
  @IsString()
  seoKeywords?: string;

  @IsOptional()
  @IsString()
  seoCanonicalUrl?: string;

  @IsOptional()
  @IsString()
  seoMetaRobots?: string;
}

class ProductVariant {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsString()
  weight?: string;

  @IsOptional()
  @IsString()
  length?: string;

  @IsOptional()
  @IsString()
  width?: string;

  @IsOptional()
  @IsString()
  height?: string;

  @IsOptional()
  @IsString()
  barCode?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  @IsNumber()
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sku?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => parseArray(value), { toClassOnly: true })
  productVariantAttributes?: string[];

  @IsOptional()
  @IsString()
  discountPix?: string;

  @IsOptional()
  @IsString()
  discountPrice?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true, {
    toClassOnly: true,
  })
  isActive?: boolean;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;

  @IsOptional()
  @IsString()
  seoKeywords?: string;

  @IsOptional()
  @IsString()
  seoCanonicalUrl?: string;

  @IsOptional()
  @IsString()
  seoMetaRobots?: string;
}

class ProductFAQItem {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsString()
  answer?: string;
}

/**
 * Helpers para parsing seguro de valores transformados
 */
function parseArray(value: unknown): string[] {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return Array.isArray(value) ? value : [];
}

function parseNestedArray<T>(value: unknown, cls: new () => T): T[] {
  const arr =
    typeof value === 'string'
      ? (() => {
          try {
            return JSON.parse(value);
          } catch {
            return [];
          }
        })()
      : value;

  if (!Array.isArray(arr)) return [];
  return arr.map((item) => plainToInstance(cls, item));
}
