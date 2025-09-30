import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateCategoryDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @IsNotEmpty()
  @IsBoolean()
  showMenu: boolean;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsNotEmpty()
  @IsString()
  seoTitle: string;

  @IsNotEmpty()
  @IsString()
  seoDescription: string;

  @IsNotEmpty()
  @IsString()
  seoKeywords: string;

  @IsNotEmpty()
  @IsString()
  seoCanonicalUrl: string;

  @IsNotEmpty()
  @IsString()
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

class CategoryFAQItem {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsString()
  question: string;

  @IsNotEmpty()
  @IsString()
  answer: string;
}
