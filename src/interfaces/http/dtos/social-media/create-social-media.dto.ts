import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateSocialMediaDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  link: string;

  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  @IsNumber()
  order: number;

  @Transform(({ value }) => value === 'true')
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
