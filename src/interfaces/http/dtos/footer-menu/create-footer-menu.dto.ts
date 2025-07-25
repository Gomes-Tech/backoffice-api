import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum FooterMenuItemType {
  LINK = 'LINK',
  IMAGE = 'IMAGE',
  TEXT = 'TEXT',
}

export class CreateFooterMenuItemDTO {
  @IsNotEmpty()
  @IsEnum(FooterMenuItemType)
  type: FooterMenuItemType;

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

export class CreateFooterMenuDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFooterMenuItemDTO)
  items?: CreateFooterMenuItemDTO[];
}
