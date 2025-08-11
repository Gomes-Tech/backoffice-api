import { Transform, Type, plainToInstance } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateProductDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true, {
    toClassOnly: true,
  })
  isGreenSeal: boolean;

  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true, {
    toClassOnly: true,
  })
  freeShipping: boolean;

  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true, {
    toClassOnly: true,
  })
  immediateShipping: boolean;

  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true, {
    toClassOnly: true,
  })
  isPersonalized: boolean;

  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true, {
    toClassOnly: true,
  })
  isExclusive: boolean;

  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true, {
    toClassOnly: true,
  })
  inCutout: boolean;

  @IsNotEmpty()
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
  categories: string[];

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  // @Type(() => ProductVariant) // opcional quando já instanciamos manualmente
  @Transform(
    ({ value }) => {
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
      // Garante instâncias de ProductVariant
      return arr.map((item) => plainToInstance(ProductVariant, item));
    },
    { toClassOnly: true },
  )
  productVariants: ProductVariant[];
}

class ProductVariant {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  stock?: number;

  @IsNotEmpty()
  @IsString()
  weight: string;

  @IsNotEmpty()
  @IsString()
  length: string;

  @IsNotEmpty()
  @IsString()
  width: string;

  @IsNotEmpty()
  @IsString()
  height: string;

  @IsOptional()
  @IsString()
  barCode?: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  sku: number;

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
  productVariantAttributes: string[];

  @IsOptional()
  @IsString()
  discountPix?: string;

  @IsOptional()
  @IsString()
  discountPrice?: string;

  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true, {
    toClassOnly: true,
  })
  isActive: boolean;

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
