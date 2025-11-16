import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Sanitize } from '@shared/decorators';
import { CategoryFAQItem } from './create-category.dto';

export class UpdateCategoryDTO {
  @IsOptional()
  @IsString()
  @Sanitize()
  name?: string;

  @IsOptional()
  @IsString()
  @Sanitize()
  slug?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  showMenu?: boolean;

  @IsOptional()
  @IsBoolean()
  showCarousel?: boolean;

  @IsOptional()
  @IsString()
  categoryImageUrl?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsString()
  @Sanitize()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @Sanitize()
  seoDescription?: string;

  @IsOptional()
  @IsString()
  @Sanitize()
  seoKeywords?: string;

  @IsOptional()
  @IsString()
  @Sanitize()
  seoCanonicalUrl?: string;

  @IsOptional()
  @IsString()
  @Sanitize()
  seoMetaRobots?: string;

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
