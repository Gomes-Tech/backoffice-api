import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateBannerDTO {
  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  desktopImageAlt?: string;

  @IsOptional()
  @IsString()
  mobileImageAlt?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  initialDate?: Date;

  @IsOptional()
  @IsDateString()
  finishDate?: Date;
}
