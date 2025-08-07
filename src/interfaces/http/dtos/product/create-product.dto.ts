import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
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
  isGreenSeal: boolean;

  @IsNotEmpty()
  @IsBoolean()
  freeShipping: boolean;

  @IsNotEmpty()
  @IsBoolean()
  immediateShipping: boolean;

  @IsNotEmpty()
  @IsBoolean()
  isPersonalized: boolean;

  @IsNotEmpty()
  @IsBoolean()
  isExclusive: boolean;

  @IsNotEmpty()
  @IsBoolean()
  inCutout: boolean;

  @IsNotEmpty()
  @IsArray()
  categories: string[];

  @IsNotEmpty()
  @IsArray()
  productVariants: ProductVariant[];
}

class ProductVariant {
  @IsNotEmpty()
  @IsString()
  stock?: string;

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

  @IsNotEmpty()
  @IsString()
  barCode: string;

  @IsNotEmpty()
  @IsBoolean()
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
