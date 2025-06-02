import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateSubCategoryDTO {
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

  @IsNotEmpty()
  @IsString()
  category: string;
}
