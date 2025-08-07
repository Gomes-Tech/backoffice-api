import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateSocialMediaDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  showHeader?: boolean;

  @IsOptional()
  @IsBoolean()
  showFooter?: boolean;
}
