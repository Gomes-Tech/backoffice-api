import { Transform } from 'class-transformer';
import {
  IsBoolean,
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
