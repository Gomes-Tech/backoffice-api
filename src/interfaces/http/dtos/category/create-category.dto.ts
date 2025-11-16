import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Sanitize } from '@shared/decorators';

export class CreateCategoryDTO {
  @IsNotEmpty()
  @IsString()
  @Sanitize()
  name: string;

  @IsNotEmpty()
  @IsString()
  @Sanitize()
  slug: string;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @IsNotEmpty()
  @IsBoolean()
  showMenu: boolean;

  @IsNotEmpty()
  @IsBoolean()
  showCarousel: boolean;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsNotEmpty()
  @IsString()
  @Sanitize()
  seoTitle: string;

  @IsNotEmpty()
  @IsString()
  @Sanitize()
  seoDescription: string;

  @IsNotEmpty()
  @IsString()
  @Sanitize()
  seoKeywords: string;

  @IsNotEmpty()
  @IsString()
  @Sanitize()
  seoCanonicalUrl: string;

  @IsNotEmpty()
  @IsString()
  @Sanitize()
  seoMetaRobots: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryFAQItem)
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
      return arr.map((item) => plainToInstance(CategoryFAQItem, item));
    },
    { toClassOnly: true },
  )
  categoryFAQ: CategoryFAQItem[];
}

export class CategoryFAQItem {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsString()
  @Sanitize()
  question: string;

  @IsNotEmpty()
  @IsString()
  @Sanitize(true)
  answer: string;
}
