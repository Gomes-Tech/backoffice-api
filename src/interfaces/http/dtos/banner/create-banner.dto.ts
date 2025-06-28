import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBannerDTO {
  @IsOptional()
  @IsString()
  link?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @IsNotEmpty()
  @IsString()
  desktopImageAlt: string;

  @IsNotEmpty()
  @IsString()
  mobileImageAlt: string;

  @IsNotEmpty()
  @IsNumber()
  order: number;

  @IsOptional()
  @IsDateString()
  initialDate?: Date;

  @IsOptional()
  @IsDateString()
  finishDate?: Date;
}
