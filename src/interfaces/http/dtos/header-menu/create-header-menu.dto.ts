import { IsBoolean, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Sanitize } from '@shared/decorators';

export class CreateHeaderMenuDTO {
  @IsNotEmpty()
  @IsString()
  @Sanitize()
  name: string;

  @IsNotEmpty()
  @IsString()
  link: string;

  @IsNotEmpty()
  @IsInt()
  order: number;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
