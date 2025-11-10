import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CategoryFAQItem } from './create-category.dto';

export class UpdateCategoryDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
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
