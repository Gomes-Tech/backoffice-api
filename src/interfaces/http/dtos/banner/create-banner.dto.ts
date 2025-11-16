import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Sanitize } from '@shared/decorators';

export class CreateBannerDTO {
  @IsOptional()
  @IsString()
  link?: string;

  @IsNotEmpty()
  @IsString()
  @Sanitize()
  name: string;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @IsNotEmpty()
  @IsNumber()
  order: number;

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
