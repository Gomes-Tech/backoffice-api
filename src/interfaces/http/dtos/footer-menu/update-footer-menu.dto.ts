import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { FooterMenuItemType } from './create-footer-menu.dto';

class UpdateFooterMenuItemDTO {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsEnum(FooterMenuItemType)
  type?: FooterMenuItemType;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  imageAlt?: string;

  @IsOptional()
  @IsString()
  imageWidth?: string;

  @IsOptional()
  @IsString()
  imageHeight?: string;

  @IsOptional()
  @IsString()
  content?: string;
}

export class UpdateFooterMenuDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateFooterMenuItemDTO)
  items?: UpdateFooterMenuItemDTO[];
}
