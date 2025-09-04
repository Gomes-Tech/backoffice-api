import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateBannerDTO {
  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  desktopImageUrl?: string;

  @IsOptional()
  @IsString()
  mobileImageUrl?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Transform(
    ({ value }) => {
      if (!value) return undefined;
      return new Date(value);
    },
    {
      toClassOnly: true,
    },
  )
  initialDate?: Date;

  @IsOptional()
  @Transform(
    ({ value }) => {
      if (!value) return undefined;
      return new Date(value);
    },
    {
      toClassOnly: true,
    },
  )
  finishDate?: Date;
}
