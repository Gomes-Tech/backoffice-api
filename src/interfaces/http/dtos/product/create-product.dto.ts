import { Transform, Type, plainToInstance } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDefined,
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

  @IsDefined()
  @IsBoolean()
  @Transform(
    ({ value }) => {
      const val =
        typeof value === 'string' ? value.replace(/^"|"$/g, '') : value;
      if (val === 'true') return true;
      if (val === 'false') return false;
      return false;
    },
    {
      toClassOnly: true,
    },
  )
  isGreenSeal: boolean;

  @IsDefined()
  @IsBoolean()
  @Transform(
    ({ value }) => {
      const val =
        typeof value === 'string' ? value.replace(/^"|"$/g, '') : value;
      if (val === 'true') return true;
      if (val === 'false') return false;
      return false;
    },
    {
      toClassOnly: true,
    },
  )
  freeShipping: boolean;

  @IsDefined()
  @IsBoolean()
  @Transform(
    ({ value }) => {
      const val =
        typeof value === 'string' ? value.replace(/^"|"$/g, '') : value;
      if (val === 'true') return true;
      if (val === 'false') return false;
      return false;
    },
    {
      toClassOnly: true,
    },
  )
  immediateShipping: boolean;

  @IsDefined()
  @IsBoolean()
  @Transform(
    ({ value }) => {
      const val =
        typeof value === 'string' ? value.replace(/^"|"$/g, '') : value;
      if (val === 'true') return true;
      if (val === 'false') return false;
      return false;
    },
    {
      toClassOnly: true,
    },
  )
  isPersonalized: boolean;

  @IsDefined()
  @IsBoolean()
  @Transform(
    ({ value }) => {
      const val =
        typeof value === 'string' ? value.replace(/^"|"$/g, '') : value;
      if (val === 'true') return true;
      if (val === 'false') return false;
      return false;
    },
    {
      toClassOnly: true,
    },
  )
  isExclusive: boolean;

  @IsDefined()
  @IsBoolean()
  @Transform(
    ({ value }) => {
      const val =
        typeof value === 'string' ? value.replace(/^"|"$/g, '') : value;
      if (val === 'true') return true;
      if (val === 'false') return false;
      return false;
    },
    {
      toClassOnly: true,
    },
  )
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
  relatedProducts: string[];

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
  similarProducts: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
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
    },
    { toClassOnly: true },
  )
  productFAQ: { question: string; answer: string }[];

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariant)
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
  @Transform(({ value }) => Number(value), { toClassOnly: true })
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

  @IsDefined()
  @IsBoolean()
  @Transform(
    ({ value }) => {
      const val =
        typeof value === 'string' ? value.replace(/^"|"$/g, '') : value;
      if (val === 'true') return true;
      if (val === 'false') return false;
      return false;
    },
    {
      toClassOnly: true,
    },
  )
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
