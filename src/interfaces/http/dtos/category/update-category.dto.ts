import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDTO {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug: string;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsBoolean()
  showMenu: boolean;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsString()
  seoTitle: string;

  @IsOptional()
  @IsString()
  seoDescription: string;

  @IsOptional()
  @IsString()
  seoKeywords: string;

  @IsOptional()
  @IsString()
  seoCanonicalUrl: string;

  @IsOptional()
  @IsString()
  seoMetaRobots: string;
}
