import { IsBoolean, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateHeaderMenuDTO {
  @IsNotEmpty()
  @IsString()
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
